// Types for EnterpriseTable, adapted from Pixel's "enterprise data table" block.

export type RowKey = string | number;

export type PinSide = "left" | "right";

/** A column as the table tracks it: width and pin state change as people resize and pin. */
export interface ColumnConfig {
  id: string;
  label: string;
  /** Current width in px */
  width: number;
  /** Narrowest the column can be dragged to; 40px when unset */
  minWidth?: number;
  /** Pinned columns stay put while the table scrolls sideways */
  pinned?: PinSide | null;
}

export interface EnterpriseTableColumn<TData = unknown> extends ColumnConfig {
  /** Cell slot name; defaults to `cell-<id>` */
  slotName?: string;
  /** Reads the cell value from a row when there's no slot; defaults to `row[id]` */
  accessor?: (row: TData) => unknown;
}

export interface EnterpriseTableFeatures {
  /** A copy of the header stays at the top while the rows scroll (default true) */
  stickyHeader?: boolean;
  /** Pin columns to the left or right from the header menu (default true) */
  columnPin?: boolean;
  /** Drag a header's right edge to resize it (default true) */
  columnResize?: boolean;
  /** Checkbox column for selecting rows (default true) */
  selectable?: boolean;
  /** Rows per page and page controls under the table (default true) */
  pagination?: boolean;
  /** Where the sticky header sits, from the top of the viewport (default "0px") */
  stickyTopOffset?: string;
}
