export const GROUP_NAME_MAX_LENGTH = 40;

/** Icons offered when creating a group; the first is used when none is picked. */
export const GROUP_EMOJI = [
  "💬",
  "📣",
  "🎨",
  "📱",
  "🧪",
  "🛠️",
  "📈",
  "✍️",
  "📸",
  "🏪",
  "☕",
  "🚀",
  "🎯",
  "💡",
  "📦",
  "📅",
  "🗂️",
  "🔒",
  "🌐",
  "🧠",
  "🤝",
  "🎉",
  "🔥",
  "⭐",
  "🏁",
  "🧩",
  "🎬",
  "🎧",
  "📚",
  "🛒",
  "💳",
  "🚚",
  "🏷️",
  "📊",
  "🧾",
  "🗺️",
  "🎁",
  "🌱",
  "⚙️",
  "🐞"
];

/** "Product design" → "product-design", for the group's URL. */
export function toSlug(name: string): string {
  return (
    name
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "group"
  );
}
