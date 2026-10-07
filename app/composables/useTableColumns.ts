import { computed, ref } from "vue";
import type { ColumnConfig, PinSide } from "~/utils/enterprise-table";

interface UseTableColumnsOptions {
  /** Starting columns; they're copied, so the caller's array isn't changed */
  columns: ColumnConfig[];
  /** Called after every resize or pin */
  onColumnsChange?: (columns: ColumnConfig[]) => void;
}

const DEFAULT_MIN_WIDTH = 40;

/**
 * Column widths and pinning for EnterpriseTable, adapted from Pixel's enterprise data table
 * block. Pinned columns are sticky, with a line on the side that faces the scrolling columns.
 */
export function useTableColumns(options: UseTableColumnsOptions) {
  const columns = ref<ColumnConfig[]>(options.columns.map((column) => ({ ...column })));
  const resizingColumnId = ref<string | null>(null);

  let startX = 0;
  let startWidth = 0;

  function getColumn(id: string) {
    return columns.value.find((column) => column.id === id);
  }

  function updateColumnWidth(id: string, width: number) {
    const column = getColumn(id);
    if (!column) return;
    column.width = Math.max(column.minWidth ?? DEFAULT_MIN_WIDTH, width);
    options.onColumnsChange?.(columns.value);
  }

  function onMouseMove(event: MouseEvent) {
    if (resizingColumnId.value) {
      updateColumnWidth(resizingColumnId.value, startWidth + event.clientX - startX);
    }
  }

  function stopResize() {
    resizingColumnId.value = null;
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", stopResize);
    document.body.style.userSelect = "";
    document.body.style.cursor = "";
  }

  /** Starts on mousedown on a header's resize handle and follows the mouse until mouseup. */
  function startResize(id: string, event: MouseEvent) {
    const column = getColumn(id);
    if (!column) return;
    resizingColumnId.value = id;
    startX = event.clientX;
    startWidth = column.width;
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", stopResize);
    document.body.style.userSelect = "none";
    document.body.style.cursor = "col-resize";
  }

  /**
   * Pins a column to one side, moving it next to the columns already pinned there (after the
   * checkbox column on the left). Pinning it to the side it's already on unpins it.
   */
  function toggleColumnPin(id: string, side: PinSide) {
    const index = columns.value.findIndex((column) => column.id === id);
    if (index === -1) return;
    const column = columns.value[index]!;
    const isUnpinning = column.pinned === side;
    const updated = { ...column, pinned: isUnpinning ? null : side };

    const next = [...columns.value];
    next.splice(index, 1);
    const checkboxIndex = next.findIndex((c) => c.id === "__checkbox");
    const leftCount = next.filter((c) => c.pinned === "left").length;
    const afterLeft = checkboxIndex === -1 ? leftCount : Math.max(checkboxIndex + 1, leftCount);
    if (isUnpinning || side === "left") {
      next.splice(afterLeft, 0, updated);
    } else {
      next.splice(next.length - next.filter((c) => c.pinned === "right").length, 0, updated);
    }

    columns.value = next;
    options.onColumnsChange?.(columns.value);
  }

  function offsetFrom(side: PinSide, id: string): number {
    const ordered = side === "left" ? columns.value : [...columns.value].reverse();
    let offset = 0;
    for (const column of ordered) {
      if (column.id === id) break;
      if (column.pinned === side) offset += column.width;
    }
    return offset;
  }

  function isEdgeOfPinned(side: PinSide, id: string): boolean {
    const pinned = columns.value.filter((column) => column.pinned === side);
    return (side === "left" ? pinned.at(-1) : pinned[0])?.id === id;
  }

  /**
   * Width and sticky position for a header or body cell. Pixel's table already gives header
   * cells (background.surface) and body cells (background.stage) an opaque fill, so pinned
   * cells keep the theme's colours and hover state.
   */
  function getColumnStyle(id: string): Record<string, string> {
    const column = getColumn(id);
    if (!column) return {};
    const style: Record<string, string> = {
      width: `${column.width}px`,
      minWidth: `${column.width}px`,
      maxWidth: `${column.width}px`
    };
    const side = column.pinned;
    if (side) {
      style.position = "sticky";
      style[side] = `${offsetFrom(side, id)}px`;
      style.zIndex = "10";
      if (isEdgeOfPinned(side, id)) {
        style.boxShadow = `inset ${side === "left" ? -2 : 2}px 0 var(--mp-colors-border-default)`;
      }
    }
    return style;
  }

  const totalWidth = computed(() => columns.value.reduce((sum, column) => sum + column.width, 0));

  return {
    columns,
    resizingColumnId,
    startResize,
    toggleColumnPin,
    getColumnStyle,
    totalWidth
  };
}
