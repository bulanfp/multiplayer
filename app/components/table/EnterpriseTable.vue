<!--
  Pixel's "enterprise data table" block (get-block "enterprise data table"), as used in Pixel's
  enterprise layout template. Compact rows, fixed column widths, columns you can resize and pin,
  a header that stays in view, row checkboxes and pagination. Changes from the block:
  - enterprise tokens instead of palette colours, and pill (is-rounded) buttons
  - clickable rows: an active row, keyboard support and a row class from the page
  - page and rows per page are v-models, so the page can reset them and slice its rows
-->
<template>
  <div
    ref="wrapperRef"
    :class="wrapperClass"
    :style="{ '--main-table-width': `${containerWidth}px` }"
  >
    <!-- ═════ Sticky copy of the header, shown once the real one scrolls away ═════ -->
    <TableStickyContainer
      v-if="merged.stickyHeader"
      :is-visible="isStickyVisible"
      :top-offset="merged.stickyTopOffset"
    >
      <div ref="stickyHeaderRef" :class="stickyScrollerClass">
        <MpTable :class="compactTableClass" :style="tableStyle">
          <MpTableHead>
            <MpTableRow>
              <template v-for="(column, index) in internalColumns" :key="column.id">
                <MpTableCell
                  v-if="column.id === CHECKBOX"
                  scope="col"
                  :style="checkboxCellStyle(column.id)"
                >
                  <MpCheckbox
                    :id="`${id}-sticky-select-all`"
                    aria-label="Select all rows"
                    :is-indeterminate="isIndeterminate"
                    :is-checked="isAllSelected"
                    @change="selectAll"
                  />
                </MpTableCell>
                <TableHeaderCell
                  v-else
                  :column="column"
                  :menu-id="`${id}-sticky-${column.id}`"
                  :is-last="index === internalColumns.length - 1"
                  :cell-style="getColumnStyle(column.id)"
                  :enable-pin="merged.columnPin"
                  :enable-resize="merged.columnResize"
                  :is-resizing="resizingColumnId === column.id"
                  use-portal
                  @resize-start="startResize"
                  @pin="toggleColumnPin"
                >
                  <slot
                    v-if="$slots[`header-${column.id}`]"
                    :name="`header-${column.id}`"
                    :column="column"
                  />
                </TableHeaderCell>
              </template>
            </MpTableRow>
          </MpTableHead>
        </MpTable>
      </div>
    </TableStickyContainer>

    <!-- ═════ Table ═════ -->
    <MpTableContainer ref="containerRef" :class="containerClass">
      <MpTable ref="tableRef" :class="compactTableClass" :style="tableStyle">
        <MpTableHead>
          <MpTableRow ref="headerRowRef">
            <template v-for="(column, index) in internalColumns" :key="column.id">
              <MpTableCell
                v-if="column.id === CHECKBOX"
                scope="col"
                :style="checkboxCellStyle(column.id)"
              >
                <MpCheckbox
                  :id="`${id}-select-all`"
                  aria-label="Select all rows"
                  :is-indeterminate="isIndeterminate"
                  :is-checked="isAllSelected"
                  @change="selectAll"
                />
              </MpTableCell>
              <TableHeaderCell
                v-else
                :column="column"
                :menu-id="`${id}-${column.id}`"
                :is-last="index === internalColumns.length - 1"
                :cell-style="getColumnStyle(column.id)"
                :enable-pin="merged.columnPin"
                :enable-resize="merged.columnResize"
                :is-resizing="resizingColumnId === column.id"
                @resize-start="startResize"
                @pin="toggleColumnPin"
              >
                <slot
                  v-if="$slots[`header-${column.id}`]"
                  :name="`header-${column.id}`"
                  :column="column"
                />
              </TableHeaderCell>
            </template>
          </MpTableRow>
        </MpTableHead>

        <MpTableBody>
          <MpTableRow v-if="!data.length">
            <MpTableCell as="td" :colspan="internalColumns.length">
              <slot name="empty">
                <MpFlex justifyContent="center" alignItems="center" paddingY="8">
                  <MpText color="text.secondary">No data available</MpText>
                </MpFlex>
              </slot>
            </MpTableCell>
          </MpTableRow>

          <MpTableRow
            v-for="(row, rowIndex) in data"
            :key="keyOf(row)"
            :class="[bodyRowClass, rowClass]"
            :data-active="isActive(row) || undefined"
            :aria-current="isActive(row) || undefined"
            :tabindex="isRowClickable ? 0 : undefined"
            @click="emit('row-click', row, rowIndex)"
            @keydown="onRowKeydown($event, row, rowIndex)"
          >
            <MpTableCell
              v-for="column in internalColumns"
              :key="column.id"
              as="td"
              :style="
                column.id === CHECKBOX ? checkboxCellStyle(column.id) : getColumnStyle(column.id)
              "
            >
              <MpCheckbox
                v-if="column.id === CHECKBOX"
                :id="`${id}-select-${keyOf(row)}`"
                :value="String(keyOf(row))"
                :aria-label="`Select row ${rowIndex + 1}`"
                :is-checked="selectedKeys.includes(keyOf(row))"
                :is-disabled="isDisabledRow(row)"
                @change="toggleRow(keyOf(row))"
                @click.stop
              />
              <slot
                v-else-if="$slots[cellSlotName(column.id)]"
                :name="cellSlotName(column.id)"
                :row="row"
                :value="cellValue(row, column.id)"
                :index="rowIndex"
                :column="column"
              />
              <template v-else>{{ cellValue(row, column.id) }}</template>
            </MpTableCell>
          </MpTableRow>
        </MpTableBody>
      </MpTable>
    </MpTableContainer>

    <!-- ═════ Pagination ═════ -->
    <TablePagination
      v-if="merged.pagination && totalItems"
      :id="`${id}-pagination`"
      v-model:page="page"
      v-model:rows-per-page="rowsPerPage"
      :total-items="totalItems"
      :rows-per-page-options="rowsPerPageOptions"
    />
  </div>
</template>

<script setup lang="ts" generic="T extends object">
import { computed, ref, watch } from "vue";
import {
  css,
  MpCheckbox,
  MpFlex,
  MpTable,
  MpTableBody,
  MpTableCell,
  MpTableContainer,
  MpTableHead,
  MpTableRow,
  MpText
} from "@mekari/pixel3";
import TableHeaderCell from "~/components/table/TableHeaderCell.vue";
import TablePagination from "~/components/table/TablePagination.vue";
import TableStickyContainer from "~/components/table/TableStickyContainer.vue";
import { useStickyTableHeader } from "~/composables/useStickyTableHeader";
import { useTableColumns } from "~/composables/useTableColumns";
import type {
  ColumnConfig,
  EnterpriseTableColumn,
  EnterpriseTableFeatures,
  RowKey
} from "~/utils/enterprise-table";

interface EnterpriseTableProps {
  /** Prefix for the ids of checkboxes and menus */
  id: string;
  /** The rows to show, already sliced to the current page */
  data: T[];
  columns: EnterpriseTableColumn<T>[];
  rowKey: keyof T | ((row: T) => RowKey);
  features?: EnterpriseTableFeatures;
  /** All rows across pages; pagination shows when this is set */
  totalItems?: number;
  rowsPerPageOptions?: number[];
  disabledKeys?: RowKey[];
  isRowDisabled?: (row: T) => boolean;
  /** Rows open something: they're focusable and Enter or Space clicks them */
  isRowClickable?: boolean;
  /** The row whose item is open, marked with data-active and aria-current */
  activeKey?: RowKey | null;
  /** Extra class for every body row */
  rowClass?: string;
}

const props = withDefaults(defineProps<EnterpriseTableProps>(), {
  features: () => ({}),
  rowsPerPageOptions: () => [10, 25, 50, 100]
});

const emit = defineEmits<{
  "update:columns": [columns: EnterpriseTableColumn<T>[]];
  "selection-change": [rows: T[], keys: RowKey[]];
  "row-click": [row: T, index: number];
}>();

const selectedKeys = defineModel<RowKey[]>("selectedKeys", { default: () => [] });
const page = defineModel<number>("page", { default: 1 });
const rowsPerPage = defineModel<number>("rowsPerPage", { default: 10 });

const CHECKBOX = "__checkbox";

const merged = computed(() => ({
  stickyHeader: true,
  columnPin: true,
  columnResize: true,
  selectable: true,
  pagination: true,
  stickyTopOffset: "0px",
  ...props.features
}));

/** The checkbox column joins the pinned columns once any column is pinned to the left. */
function toInternal(columns: EnterpriseTableColumn<T>[]): ColumnConfig[] {
  const internal: ColumnConfig[] = merged.value.selectable
    ? [
        {
          id: CHECKBOX,
          label: "",
          width: 32,
          minWidth: 32,
          pinned: columns.some((column) => column.pinned === "left") ? "left" : null
        }
      ]
    : [];
  return [
    ...internal,
    ...columns.map(({ id, label, width, minWidth, pinned }) => ({
      id,
      label,
      width,
      minWidth,
      pinned: pinned ?? null
    }))
  ];
}

const {
  columns: internalColumns,
  resizingColumnId,
  startResize,
  toggleColumnPin,
  getColumnStyle,
  totalWidth
} = useTableColumns({
  columns: toInternal(props.columns),
  onColumnsChange: (columns) => {
    const checkbox = columns.find((column) => column.id === CHECKBOX);
    if (checkbox) {
      checkbox.pinned = columns.some((c) => c.id !== CHECKBOX && c.pinned === "left")
        ? "left"
        : null;
    }
    emit(
      "update:columns",
      columns
        .filter((column) => column.id !== CHECKBOX)
        .map((column) => ({
          ...props.columns.find((original) => original.id === column.id)!,
          width: column.width,
          pinned: column.pinned
        }))
    );
  }
});

watch(
  () => props.columns,
  (columns) => (internalColumns.value = toInternal(columns)),
  { deep: true }
);

const tableStyle = computed(() => ({ tableLayout: "fixed", minWidth: `${totalWidth.value}px` }));

function checkboxCellStyle(columnId: string) {
  return { ...getColumnStyle(columnId), paddingLeft: "12px", paddingRight: "0" };
}

// ═════ Sticky header ═════
const wrapperRef = ref<HTMLElement | null>(null);
const containerRef = ref<InstanceType<typeof MpTableContainer> | null>(null);
const stickyHeaderRef = ref<HTMLElement | null>(null);
const tableRef = ref<InstanceType<typeof MpTable> | null>(null);
const headerRowRef = ref<InstanceType<typeof MpTableRow> | null>(null);

const { isStickyVisible, containerWidth } = useStickyTableHeader({
  wrapperRef,
  containerRef,
  stickyHeaderRef,
  tableRef,
  headerRowRef
});

// ═════ Rows ═════
function keyOf(row: T): RowKey {
  return typeof props.rowKey === "function"
    ? props.rowKey(row)
    : (row[props.rowKey] as unknown as RowKey);
}

function isActive(row: T): boolean {
  return props.activeKey != null && keyOf(row) === props.activeKey;
}

function cellSlotName(columnId: string): string {
  return props.columns.find((column) => column.id === columnId)?.slotName ?? `cell-${columnId}`;
}

function cellValue(row: T, columnId: string): unknown {
  const accessor = props.columns.find((column) => column.id === columnId)?.accessor;
  return accessor ? accessor(row) : (row as Record<string, unknown>)[columnId];
}

function onRowKeydown(event: KeyboardEvent, row: T, index: number) {
  if (!props.isRowClickable || event.target !== event.currentTarget) return;
  if (event.key !== "Enter" && event.key !== " ") return;
  event.preventDefault();
  emit("row-click", row, index);
}

// ═════ Selection ═════
function isDisabledRow(row: T): boolean {
  return Boolean(props.disabledKeys?.includes(keyOf(row)) || props.isRowDisabled?.(row));
}

const selectableKeys = computed(() =>
  props.data.filter((row) => !isDisabledRow(row)).map((row) => keyOf(row))
);

const isAllSelected = computed(
  () =>
    selectableKeys.value.length > 0 &&
    selectableKeys.value.every((key) => selectedKeys.value.includes(key))
);

const isIndeterminate = computed(() => selectedKeys.value.length > 0 && !isAllSelected.value);

function selectAll(checked: boolean) {
  selectedKeys.value = checked ? [...selectableKeys.value] : [];
}

function toggleRow(key: RowKey) {
  selectedKeys.value = selectedKeys.value.includes(key)
    ? selectedKeys.value.filter((selected) => selected !== key)
    : [...selectedKeys.value, key];
}

watch(
  selectedKeys,
  (keys) =>
    emit(
      "selection-change",
      props.data.filter((row) => keys.includes(keyOf(row))),
      keys
    ),
  { deep: true }
);

// ═════ Styles ═════
const wrapperClass = css({ position: "relative", display: "flex", flexDirection: "column" });

const stickyScrollerClass = css({
  w: "var(--main-table-width)",
  maxW: "var(--main-table-width)",
  overflow: "hidden"
});

const containerClass = css({ w: "full", maxW: "full", overflow: "auto" });

// The block's compact density. Pixel's table also fixes cells at 52px tall, which the block's
// template doesn't have, so height goes back to auto: 33px header, about 40px rows.
const compactTableClass = css({
  "& th, & td": { minH: "7 !important", h: "auto !important", px: "2 !important" },
  "& th": { py: "1.5 !important" },
  "& td": { py: "2.5 !important", verticalAlign: "top" }
});

const bodyRowClass = css({
  _focusVisible: { outline: "2px solid", outlineColor: "border.focused", outlineOffset: "-2px" }
});
</script>
