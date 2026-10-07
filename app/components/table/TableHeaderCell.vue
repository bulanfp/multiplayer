<template>
  <MpTableCell scope="col" class="group" :class="cellClass" :style="cellStyle">
    <slot>
      <!-- Label, plus a pin menu that shows on hover -->
      <MpFlex alignItems="center" justifyContent="space-between" gap="1">
        <span :class="labelClass">{{ column.label }}</span>

        <MpPopover
          v-if="enablePin && column.label"
          :id="`${menuId}-popover`"
          v-slot="{ onClosePopover }"
          :use-portal="usePortal"
          placement="bottom-end"
        >
          <MpPopoverTrigger>
            <MpButton
              is-rounded
              variant="ghost"
              size="sm"
              :aria-label="`${column.label} column options`"
              :class="menuButtonClass"
            >
              <MpIcon name="chevrons-down" size="sm" />
            </MpButton>
          </MpPopoverTrigger>
          <MpPopoverContent :class="css({ minW: '160px' })">
            <MpPopoverList :class="css({ py: '1' })">
              <MpPopoverListItem
                v-for="side in SIDES"
                :key="side"
                :is-active="column.pinned === side"
                @click="pin(side, onClosePopover)"
              >
                <MpFlex alignItems="center" gap="2">
                  <MpIcon :name="column.pinned === side ? 'unpin' : 'pin'" size="sm" />
                  {{ column.pinned === side ? `Unpin from ${side}` : `Pin to ${side}` }}
                </MpFlex>
              </MpPopoverListItem>
            </MpPopoverList>
          </MpPopoverContent>
        </MpPopover>
      </MpFlex>
    </slot>

    <!-- Drag the right edge to resize; not on the last column -->
    <div
      v-if="enableResize && !isLast"
      draggable="false"
      :class="resizeHandleClass"
      :data-resizing="isResizing || undefined"
      aria-hidden="true"
      @mousedown.stop.prevent="emit('resizeStart', column.id, $event)"
    />
  </MpTableCell>
</template>

<script setup lang="ts">
import {
  css,
  MpButton,
  MpFlex,
  MpIcon,
  MpPopover,
  MpPopoverContent,
  MpPopoverList,
  MpPopoverListItem,
  MpPopoverTrigger,
  MpTableCell
} from "@mekari/pixel3";
import type { ColumnConfig, PinSide } from "~/utils/enterprise-table";

interface TableHeaderCellProps {
  column: ColumnConfig;
  /** Unique per table and copy (the sticky header renders the cells twice) */
  menuId: string;
  isLast: boolean;
  /** Width and pin position from useTableColumns */
  cellStyle: Record<string, string>;
  enablePin?: boolean;
  enableResize?: boolean;
  isResizing?: boolean;
  /** The sticky copy of the header portals its menu so the menu isn't clipped */
  usePortal?: boolean;
}

const props = withDefaults(defineProps<TableHeaderCellProps>(), {
  enablePin: true,
  enableResize: true,
  isResizing: false,
  usePortal: false
});

const emit = defineEmits<{
  resizeStart: [columnId: string, event: MouseEvent];
  pin: [columnId: string, side: PinSide];
}>();

const SIDES: PinSide[] = ["left", "right"];

function pin(side: PinSide, close: () => void) {
  emit("pin", props.column.id, side);
  close();
}

const cellClass = css({ position: "relative" });

const labelClass = css({ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" });

// Hidden until the header cell is hovered or the button has keyboard focus.
const menuButtonClass = css({
  flexShrink: "0",
  // A 20px circle, as in the block, so the button doesn't make the header taller.
  w: "20px",
  h: "20px",
  p: "0",
  opacity: "0",
  transition: "opacity 150ms",
  _groupHover: { opacity: "1" },
  _focusVisible: { opacity: "1" },
  "&[aria-expanded=true]": { opacity: "1" }
});

const resizeHandleClass = css({
  position: "absolute",
  top: "0",
  bottom: "0",
  right: "-2px",
  zIndex: "10",
  w: "4px",
  cursor: "col-resize",
  _hover: { bg: "background.brand.bold.hovered" },
  "&[data-resizing]": { bg: "background.brand.bold.pressed" }
});
</script>
