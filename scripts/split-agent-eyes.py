#!/usr/bin/env python3
"""Split each 3D agent icon into its body and its eyes, so the eyes can move on their own.

AgentMascot.vue stacks the two layers to make an agent look around, blink and hop, and
Airene turn all the way round. Run this again after adding or changing an icon in
public/images/agents/. It needs Python 3 and Pillow (pip install pillow):

    python3 scripts/split-agent-eyes.py

For every icon it writes, in public/images/agents/parts/:
  <icon>-body.png   the icon with the eyes painted over in the body's own shading
  <icon>-eyes.png   just the eyes, on a transparent canvas the same size as the icon
  <icon>-extra.png  only for icons with a part floating free of the body (Airene's sparkle)
and app/data/agent-mascots.ts, with where the eyes, the body and any extra part sit.
"""

from collections import deque
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
ICONS = ROOT / "public" / "images" / "agents"
PARTS = ICONS / "parts"
DATA = ROOT / "app" / "data" / "agent-mascots.ts"

# How far past the white of the eye the painted-over area reaches: its soft edge and the
# slight dimple around it.
EDGE = 6
# Largest sideways glance, as a share of the icon, so the eyes never slide off a small body.
MAX_LOOK = 0.1
# Rounds of smoothing for the painted-over area.
ROUNDS = 200


def is_white(pixel):
    r, g, b, a = pixel
    return a >= 250 and min(r, g, b) >= 205 and max(r, g, b) - min(r, g, b) <= 30


def blobs(points, corners=False):
    """Groups of touching points, largest first. With `corners`, diagonal neighbours touch too."""
    steps = [(1, 0), (-1, 0), (0, 1), (0, -1)]
    if corners:
        steps += [(1, 1), (1, -1), (-1, 1), (-1, -1)]
    left = set(points)
    groups = []
    while left:
        start = left.pop()
        group = [start]
        queue = deque([start])
        while queue:
            x, y = queue.popleft()
            for near in ((x + dx, y + dy) for dx, dy in steps):
                if near in left:
                    left.remove(near)
                    group.append(near)
                    queue.append(near)
        groups.append(group)
    return sorted(groups, key=len, reverse=True)


def describe(group):
    xs = [x for x, _ in group]
    ys = [y for _, y in group]
    return {
        "points": group,
        "size": len(group),
        "x": sum(xs) / len(xs),
        "y": sum(ys) / len(ys),
        "width": max(xs) - min(xs) + 1,
        "height": max(ys) - min(ys) + 1,
    }


def find_eyes(image):
    """The whites of the two eyes: about the same size, side by side and taller than wide.
    Shine on the body is also near white, but it's wider than tall or a stray dot."""
    width, height = image.size
    pixels = image.load()
    whites = [(x, y) for y in range(height) for x in range(width) if is_white(pixels[x, y])]
    candidates = [
        describe(group)
        for group in blobs(whites)
        if len(group) >= 100
    ]
    candidates = [blob for blob in candidates if blob["height"] >= blob["width"]]
    best = None
    for index, one in enumerate(candidates):
        for other in candidates[index + 1:]:
            if abs(one["y"] - other["y"]) > 8 or not 15 <= abs(one["x"] - other["x"]) <= 90:
                continue
            if max(one["size"], other["size"]) > 1.3 * min(one["size"], other["size"]):
                continue
            if best is None or one["size"] + other["size"] > best[0]["size"] + best[1]["size"]:
                best = (one, other)
    return best


def grow(points, radius, inside):
    """Every point within `radius` of `points` (a round brush), kept to `inside`."""
    points = set(points)
    brush = [
        (dx, dy)
        for dy in range(-radius, radius + 1)
        for dx in range(-radius, radius + 1)
        if dx * dx + dy * dy <= radius * radius
    ]
    rim = [
        (x, y)
        for x, y in points
        if any(near not in points for near in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)))
    ]
    grown = set(points)
    for x, y in rim:
        for dx, dy in brush:
            near = (x + dx, y + dy)
            if near in inside:
                grown.add(near)
    return grown


def paint_over(colors, hole):
    """Fill `hole` from its rim inwards, then smooth it so it follows the body's shading."""
    known = {point for point in colors if point not in hole}
    todo = set(hole)
    while todo:
        ring = {}
        for x, y in todo:
            near = [
                colors[(x + dx, y + dy)]
                for dx in (-1, 0, 1)
                for dy in (-1, 0, 1)
                if (dx or dy) and (x + dx, y + dy) in known
            ]
            if near:
                ring[(x, y)] = [sum(channel) / len(near) for channel in zip(*near)]
        if not ring:
            raise SystemExit("Can't paint over the eyes: they touch the edge of the icon")
        colors.update(ring)
        known.update(ring)
        todo.difference_update(ring)
    order = sorted(hole, key=lambda point: (point[1], point[0]))
    for _ in range(ROUNDS):
        for x, y in order:
            here = colors[(x, y)]
            near = [
                colors.get(point, here)
                for point in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1))
            ]
            average = [sum(channel) / 4 for channel in zip(*near)]
            colors[(x, y)] = [
                old + 1.8 * (new - old) for old, new in zip(colors[(x, y)], average)
            ]


def eye_layer(original, body, whites, area, white):
    """The eyes on their own. Their soft edge is unblended from the body under it, so the
    eyes look the same wherever they move to on the body."""
    layer = {}
    for point in area:
        color = original[point]
        if point in whites:
            layer[point] = (*[round(channel) for channel in color], 255)
            continue
        under = body[point]
        toward = [w - u for w, u in zip(white, under)]
        length = sum(channel * channel for channel in toward)
        amount = sum((c - u) * t for c, u, t in zip(color, under, toward)) / length if length else 0
        amount = max(0.0, min(1.0, amount))
        if amount < 0.02:
            continue
        unblended = [
            max(0, min(255, round((c - (1 - amount) * u) / amount))) for c, u in zip(color, under)
        ]
        layer[point] = (*unblended, round(amount * 255))
    return layer


def number(value):
    text = f"{value:.1f}"
    return text[:-2] if text.endswith(".0") else text


def split(path):
    image = Image.open(path).convert("RGBA")
    width, height = image.size
    pixels = image.load()

    eyes = find_eyes(image)
    if not eyes:
        print(f"  {path.name}: no eyes found, skipped")
        return None
    whites = set(eyes[0]["points"]) | set(eyes[1]["points"])

    solid = {(x, y) for y in range(height) for x in range(width) if pixels[x, y][3] >= 250}
    area = grow(whites, EDGE, solid)

    colors = {point: list(pixels[point][:3]) for point in solid}
    original = {point: list(pixels[point][:3]) for point in area}
    paint_over(colors, area)

    body = image.copy()
    body_pixels = body.load()
    for point in area:
        body_pixels[point] = (*[max(0, min(255, round(c))) for c in colors[point]], pixels[point][3])

    white = [sum(pixels[point][channel] for point in whites) / len(whites) for channel in range(3)]
    layer = eye_layer(original, {point: colors[point] for point in area}, whites, area, white)
    eyes_image = Image.new("RGBA", image.size, (0, 0, 0, 0))
    eyes_pixels = eyes_image.load()
    for point, value in layer.items():
        eyes_pixels[point] = value

    # The body is the biggest shape. Anything floating free of it, like Airene's sparkle, goes
    # on a layer of its own so it can move by itself.
    shapes = blobs(
        [(x, y) for y in range(height) for x in range(width) if pixels[x, y][3] >= 16], corners=True
    )
    loose = {point for shape in shapes[1:] if len(shape) >= 150 for point in shape}
    extra_image = None
    if loose:
        faint = {(x, y) for y in range(height) for x in range(width) if 0 < pixels[x, y][3] < 16}
        loose = grow(loose, 2, loose | faint)
        extra_image = Image.new("RGBA", image.size, (0, 0, 0, 0))
        extra_pixels = extra_image.load()
        for point in loose:
            extra_pixels[point] = pixels[point]
            body_pixels[point] = (0, 0, 0, 0)

    PARTS.mkdir(parents=True, exist_ok=True)
    body.save(PARTS / f"{path.stem}-body.png", optimize=True)
    eyes_image.save(PARTS / f"{path.stem}-eyes.png", optimize=True)
    if extra_image:
        extra_image.save(PARTS / f"{path.stem}-extra.png", optimize=True)
    else:
        (PARTS / f"{path.stem}-extra.png").unlink(missing_ok=True)

    shape = shapes[0]
    xs = [x for x, _ in shape]
    left, right, bottom = min(xs), max(xs), max(y for _, y in shape)

    # How far the eyes can move sideways and still sit wholly on the body.
    reach = []
    for step in (1, -1):
        shift = 0
        while shift < width and all((x + (shift + 1) * step, y) in solid for x, y in whites):
            shift += 1
        reach.append(shift)
    look = min(min(reach) * 0.8, MAX_LOOK * width)

    geometry = {
        "eyesX": 100 * (sum(x for x, _ in whites) / len(whites) + 0.5) / width,
        "eyesY": 100 * (sum(y for _, y in whites) / len(whites) + 0.5) / height,
        "look": 100 * look / width,
        "baseX": 100 * (left + right + 1) / 2 / width,
        "baseY": 100 * (bottom + 1) / height,
        "width": 100 * (right - left + 1) / width,
    }
    if loose:
        loose_xs = [x for x, _ in loose]
        loose_ys = [y for _, y in loose]
        geometry["extraX"] = 100 * (min(loose_xs) + max(loose_xs) + 1) / 2 / width
        geometry["extraY"] = 100 * (min(loose_ys) + max(loose_ys) + 1) / 2 / height
    return geometry


HEADER = """// Generated by scripts/split-agent-eyes.py: run it again after changing an icon in
// public/images/agents/. Each 3D icon is split into its body and its eyes
// (public/images/agents/parts/), so AgentMascot.vue can move the eyes on their own.
// Values are percentages of the icon.

export interface MascotGeometry {
  /** Middle point between the two eyes */
  eyesX: number;
  eyesY: number;
  /** How far the eyes can glance sideways and stay on the body */
  look: number;
  /** Middle of the bottom of the body, where its shadow sits */
  baseX: number;
  baseY: number;
  /** Width of the body */
  width: number;
  /** Middle of a part floating free of the body, like Airene's sparkle (<icon>-extra.png) */
  extraX?: number;
  extraY?: number;
}

export const MASCOT_GEOMETRY: Record<string, MascotGeometry> = {
"""


def main():
    found = {}
    for path in sorted(ICONS.glob("*.png")):
        print(path.name)
        geometry = split(path)
        if geometry:
            found[path.stem] = geometry
    rows = []
    for index, (name, geometry) in enumerate(found.items()):
        key = name if name.isidentifier() else f'"{name}"'
        values = [f"{field}: {number(value)}" for field, value in geometry.items()]
        row = f"  {key}: {{ {', '.join(values)} }}"
        # Laid out the way Prettier would: one line when it fits in 100 characters.
        comma = 0 if index == len(found) - 1 else 1
        if len(row) + comma > 100:
            row = f"  {key}: {{\n" + ",\n".join(f"    {value}" for value in values) + "\n  }"
        rows.append(row)
    DATA.write_text(HEADER + ",\n".join(rows) + "\n};\n")
    print(f"Wrote {len(found)} icons to {PARTS.relative_to(ROOT)} and {DATA.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
