<template>
  <MpFlex justifyContent="space-between" alignItems="center" gap="4" :class="rootClass">
    <MpFlex alignItems="center" gap="2">
      <MpText color="text.secondary">Rows per page</MpText>
      <MpPopover :id="`${id}-rows`" is-close-on-select>
        <MpPopoverTrigger>
          <MpButton
            is-rounded
            variant="ghost"
            size="sm"
            right-icon="chevrons-down"
            :aria-label="`Rows per page: ${rowsPerPage}`"
          >
            {{ rowsPerPage }}
          </MpButton>
        </MpPopoverTrigger>
        <MpPopoverContent>
          <MpPopoverList :class="css({ py: '1' })">
            <MpPopoverListItem
              v-for="option in rowsPerPageOptions"
              :key="option"
              :is-active="rowsPerPage === option"
              @click="setRowsPerPage(option)"
            >
              {{ option }}
            </MpPopoverListItem>
          </MpPopoverList>
        </MpPopoverContent>
      </MpPopover>
      <MpText color="text.secondary">Showing {{ first }}–{{ last }} of {{ totalItems }}</MpText>
    </MpFlex>

    <MpFlex alignItems="center" gap="2">
      <MpText color="text.secondary">
        {{ page }} of {{ totalPages }} {{ totalPages === 1 ? "page" : "pages" }}
      </MpText>
      <MpButton
        is-rounded
        variant="ghost"
        size="sm"
        left-icon="chevrons-left"
        aria-label="Previous page"
        :is-disabled="page <= 1"
        @click="page--"
      />
      <MpButton
        is-rounded
        variant="ghost"
        size="sm"
        left-icon="chevrons-right"
        aria-label="Next page"
        :is-disabled="page >= totalPages"
        @click="page++"
      />
    </MpFlex>
  </MpFlex>
</template>

<script setup lang="ts">
import { computed } from "vue";
import {
  css,
  MpButton,
  MpFlex,
  MpPopover,
  MpPopoverContent,
  MpPopoverList,
  MpPopoverListItem,
  MpPopoverTrigger,
  MpText
} from "@mekari/pixel3";

interface TablePaginationProps {
  /** Prefix for the rows-per-page menu's id */
  id: string;
  totalItems: number;
  rowsPerPageOptions: number[];
}

const props = defineProps<TablePaginationProps>();

const page = defineModel<number>("page", { required: true });
const rowsPerPage = defineModel<number>("rowsPerPage", { required: true });

const totalPages = computed(() => Math.max(1, Math.ceil(props.totalItems / rowsPerPage.value)));
const first = computed(() =>
  props.totalItems ? Math.min((page.value - 1) * rowsPerPage.value + 1, props.totalItems) : 0
);
const last = computed(() => Math.min(page.value * rowsPerPage.value, props.totalItems));

function setRowsPerPage(option: number) {
  rowsPerPage.value = option;
  page.value = 1;
}

const rootClass = css({ py: "3", px: "2" });
</script>
