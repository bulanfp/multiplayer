<template>
  <div v-if="workspace" :class="pageClass">
    <PageHeader title="Library" />

    <!-- ═════ Tabs: on top of the container, the selected one underlined on its edge ═════ -->
    <MpTabs
      id="library-tabs"
      v-model="tab"
      is-manual
      :is-show-border="false"
      :has-margin-bottom="false"
    >
      <MpTabList :class="tabListClass">
        <MpTab v-for="label in TABS" :key="label" :data-text="label">{{ label }}</MpTab>
      </MpTabList>
    </MpTabs>

    <PageContent :padded="false" :class="css({ roundedTopLeft: 'xl' })">
      <div :class="splitClass">
        <div ref="listPaneRef" :class="listPaneClass">
          <!-- ═════ Toolbar: the Type filter on the left, search on the right ═════ -->
          <div :class="toolbarClass">
            <SelectPopover
              id="library-type-filter"
              v-model="typeFilter"
              label="Type"
              placeholder="Type"
              :options="typeOptions"
              :class="css({ w: '180px' })"
            />
            <div :class="css({ w: '280px', maxW: 'full' })">
              <SearchInput id="library-search" v-model="query" placeholder="Search the library" />
            </div>
          </div>

          <!-- ═════ Table: Pixel's enterprise data table ═════ -->
          <EnterpriseTable
            id="library-table"
            v-model:page="page"
            v-model:rows-per-page="rowsPerPage"
            :data="pageRows"
            :columns="COLUMNS"
            :row-key="rowKey"
            :features="tableFeatures"
            :total-items="rows.length"
            :rows-per-page-options="ROWS_PER_PAGE"
            is-row-clickable
            :active-key="panel ? `${panel.kind}:${panel.id}` : null"
            :row-class="rowClass"
            @row-click="openRow"
          >
            <template #cell-name="{ row }">
              <MpFlex alignItems="center" gap="2" minWidth="0">
                <MpIcon
                  :name="row.icon"
                  size="md"
                  :color="row.kind === 'output' ? 'icon.brand' : 'icon.default'"
                  :class="css({ flexShrink: '0' })"
                />
                <MpText data-name is-truncated>{{ row.name }}</MpText>
              </MpFlex>
            </template>
            <template #cell-version="{ row }">
              <template v-if="row.version">v{{ row.version }}</template>
              <MpText v-else as="span" color="text.secondary">-</MpText>
            </template>
            <template #cell-size="{ row }">
              <template v-if="row.size">{{ row.size }}</template>
              <MpText v-else as="span" color="text.secondary">-</MpText>
            </template>
            <template #cell-updatedBy="{ row }">
              <MpFlex alignItems="center" gap="2" minWidth="0">
                <MemberAvatar :actor="row.actor" size="sm" />
                <MpText is-truncated>{{ actorName(row.actor) }}</MpText>
              </MpFlex>
            </template>
            <template #cell-updatedAt="{ row }">{{ formatDateTime(row.updatedAt) }}</template>

            <template #empty>
              <MpFlex
                v-if="isNarrowed"
                direction="column"
                alignItems="center"
                gap="1"
                paddingY="10"
              >
                <MpText weight="semiBold">No results found</MpText>
                <MpText color="text.secondary">Try adjusting your filters or search.</MpText>
                <MpButton is-rounded variant="textLink" @click="clearAll">
                  Clear all filters
                </MpButton>
              </MpFlex>
              <MpFlex v-else direction="column" alignItems="center" gap="1" paddingY="10">
                <MpText weight="semiBold">Nothing here yet</MpText>
                <MpText color="text.secondary">
                  Artifacts your agents create and files your team shares show up here.
                </MpText>
              </MpFlex>
            </template>
          </EnterpriseTable>
        </div>

        <!-- ═════ Preview: an output's canvas or a file, one at a time ═════ -->
        <SidePanelTransition>
          <OutputCanvas
            v-if="panel?.kind === 'output'"
            key="output"
            :output-id="panel.id"
            :version="panel.version"
            :source-label="outputSource"
            @close="panel = null"
            @update:version="setVersion"
          />
          <FilePreview
            v-else-if="panel?.kind === 'file'"
            key="file"
            :file-id="panel.id"
            :source="fileSource"
            @close="panel = null"
          />
        </SidePanelTransition>
      </div>
    </PageContent>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import {
  css,
  MpButton,
  MpFlex,
  MpIcon,
  MpTab,
  MpTabList,
  MpTabs,
  MpText,
  type IconName
} from "@mekari/pixel3";
import SearchInput from "~/components/chat/SearchInput.vue";
import PageContent from "~/components/layout/PageContent.vue";
import PageHeader from "~/components/layout/PageHeader.vue";
import SidePanelTransition from "~/components/layout/SidePanelTransition.vue";
import FilePreview from "~/components/pages/FilePreview.vue";
import MemberAvatar from "~/components/shared/MemberAvatar.vue";
import SelectPopover from "~/components/shared/SelectPopover.vue";
import EnterpriseTable from "~/components/table/EnterpriseTable.vue";
import OutputCanvas from "~/components/thread/OutputCanvas.vue";
import { useChatStore } from "~/composables/useChatStore";
import { useCurrentWorkspace } from "~/composables/useCurrentWorkspace";
import { useWorkspaceStore } from "~/composables/useWorkspaceStore";
import type { Actor, Output } from "~/data/types";
import { actorName } from "~/utils/directory";
import type { EnterpriseTableColumn } from "~/utils/enterprise-table";
import { FILE_TYPES } from "~/utils/files";
import { formatDateTime } from "~/utils/format";
import { conversationPath } from "~/utils/paths";

interface LibraryRowData {
  id: string;
  kind: "output" | "file";
  name: string;
  icon: IconName;
  type: string;
  /** Files only; outputs show "-" */
  size?: string;
  source: string;
  actor: Actor;
  updatedAt: string;
  /** Outputs only: how many versions there are; files show "-" */
  version?: number;
}

/** What the side panel shows: an output at one of its versions, or a file. */
type Panel = { kind: "output"; id: string; version: number } | { kind: "file"; id: string };

// Fixed starting widths; people can drag a header's edge to resize or pin from its menu.
const COLUMNS: EnterpriseTableColumn<LibraryRowData>[] = [
  { id: "name", label: "Name", width: 320, minWidth: 160 },
  { id: "version", label: "Version", width: 90 },
  { id: "type", label: "Type", width: 120 },
  { id: "size", label: "Size", width: 100 },
  { id: "source", label: "Source", width: 160 },
  { id: "updatedBy", label: "Updated by", width: 200 },
  { id: "updatedAt", label: "Last updated", width: 160 }
];

const ROWS_PER_PAGE = [10, 25, 50];

const TABS = ["All", "Artifacts", "Files"];

const { workspace } = useCurrentWorkspace();
const { outputsFor, filesFor, getOutput, getFile } = useChatStore();
const { getConversationById, conversationLabel } = useWorkspaceStore();

const tab = ref(0);
const query = ref("");
/** "" shows the "Type" placeholder; "all" is the explicit "All types" choice */
const typeFilter = ref("");
const panel = ref<Panel | null>(null);
const page = ref(1);
const rowsPerPage = ref(ROWS_PER_PAGE[0]!);

function sourceOf(threadId: string): string {
  const conversation = getConversationById(threadId);
  return conversation ? conversationLabel(conversation) : "-";
}

/** Private Airene chats stay out of the Library; an output joins once it's shared to a group. */
function isPrivate(threadId: string): boolean {
  return getConversationById(threadId)?.kind === "agent";
}

/** Where everyone can find it: its conversation, or the group it was shared to from Airene. */
function visibleThreadOf(output: Output): string | undefined {
  return isPrivate(output.threadId) ? output.sharedThreadIds?.[0] : output.threadId;
}

const outputRows = computed<LibraryRowData[]>(() =>
  workspace.value
    ? outputsFor(workspace.value.id).flatMap((output): LibraryRowData[] => {
        const threadId = visibleThreadOf(output);
        if (!threadId) return [];
        const latest = output.versions.at(-1)!;
        const row: LibraryRowData = {
          id: output.id,
          kind: "output",
          name: output.title,
          icon: "doc",
          type: output.kind,
          source: sourceOf(threadId),
          actor: { kind: "agent", id: latest.agentId },
          updatedAt: latest.createdAt,
          version: output.versions.length
        };
        return [row];
      })
    : []
);

const fileRows = computed<LibraryRowData[]>(() =>
  workspace.value
    ? filesFor(workspace.value.id)
        .filter((file) => !isPrivate(file.threadId))
        .map((file) => ({
          id: file.id,
          kind: "file",
          name: file.name,
          icon: FILE_TYPES[file.type].icon,
          type: FILE_TYPES[file.type].label,
          size: file.size,
          source: sourceOf(file.threadId),
          actor: { kind: "person", id: file.uploadedBy },
          updatedAt: file.uploadedAt
        }))
    : []
);

const allRows = computed(() => [...outputRows.value, ...fileRows.value]);

const tabRows = computed(
  () => [allRows.value, outputRows.value, fileRows.value][tab.value] ?? allRows.value
);

const byName = (a: string, b: string) => a.localeCompare(b);

// The Type filter offers the types in the open tab.
const typeOptions = computed(() => [
  { value: "all", label: "All types" },
  ...[...new Set(tabRows.value.map((row) => row.type))]
    .sort(byName)
    .map((type) => ({ value: type, label: type }))
]);

watch(typeOptions, (options) => {
  if (!options.some((option) => option.value === typeFilter.value)) typeFilter.value = "";
});

const isNarrowed = computed(
  () => Boolean(query.value.trim()) || (typeFilter.value !== "" && typeFilter.value !== "all")
);

const rows = computed(() => {
  const needle = query.value.trim().toLowerCase();
  const type = typeFilter.value === "all" ? "" : typeFilter.value;
  return tabRows.value
    .filter(
      (row) => (!type || row.type === type) && (!needle || row.name.toLowerCase().includes(needle))
    )
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
});

function clearAll() {
  query.value = "";
  typeFilter.value = "";
}

const pageRows = computed(() =>
  rows.value.slice((page.value - 1) * rowsPerPage.value, page.value * rowsPerPage.value)
);

// A new tab, filter or search starts again from the first page.
watch([tab, query, typeFilter], () => (page.value = 1));

const rowKey = (row: LibraryRowData) => `${row.kind}:${row.id}`;

// The table's header copy sticks to the top of the list as it scrolls.
const listPaneRef = ref<HTMLElement | null>(null);
const stickyTop = ref("0px");
onMounted(() => {
  stickyTop.value = `${listPaneRef.value?.getBoundingClientRect().top ?? 0}px`;
});
const tableFeatures = computed(() => ({ selectable: false, stickyTopOffset: stickyTop.value }));

const outputSource = computed(() => {
  const output = panel.value?.kind === "output" ? getOutput(panel.value.id) : undefined;
  const threadId = output ? visibleThreadOf(output) : undefined;
  return threadId ? `from ${sourceOf(threadId)}` : undefined;
});

// The file preview links back to the conversation the file was shared in.
const fileSource = computed(() => {
  const file = panel.value?.kind === "file" ? getFile(panel.value.id) : undefined;
  const conversation = file ? getConversationById(file.threadId) : undefined;
  return workspace.value && conversation
    ? {
        label: conversationLabel(conversation),
        to: conversationPath(workspace.value.id, conversation.slug)
      }
    : undefined;
});

useHead({ title: "Library" });

function isActive(row: LibraryRowData): boolean {
  return panel.value?.kind === row.kind && panel.value.id === row.id;
}

// Outputs open on their latest version. Clicking the open row again keeps it as it is.
function openRow(row: LibraryRowData) {
  if (isActive(row)) return;
  panel.value =
    row.kind === "output"
      ? { kind: "output", id: row.id, version: row.version ?? 1 }
      : { kind: "file", id: row.id };
}

function setVersion(version: number) {
  if (panel.value?.kind === "output") panel.value = { ...panel.value, version };
}

const pageClass = css({ display: "flex", flexDirection: "column", flex: "1", minH: "0" });

const splitClass = css({ display: "flex", h: "full", overflow: "hidden" });

const listPaneClass = css({ flex: "1", minW: "0", overflowY: "auto", p: "6" });

// Tabs line up with the title, and the selected one is semibold. Each tab keeps the width of
// its bold label (a hidden copy), so switching tabs doesn't shift the others.
const tabListClass = css({
  // Pulled 16px up, closer to the title.
  mt: "-4",
  // The list and each tab pad their text by 6px, so 18px puts the labels 24px in, like the title.
  pl: "18px",
  pr: "6",
  "& [data-text]": { flexDirection: "column" },
  "& [data-text]::after": {
    content: "attr(data-text)",
    h: "0",
    overflow: "hidden",
    visibility: "hidden",
    fontWeight: "semiBold",
    userSelect: "none",
    pointerEvents: "none"
  },
  "& [aria-selected=true]": { fontWeight: "semiBold" }
});

// The same space under the toolbar as above it (the list's 24px padding).
const toolbarClass = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  flexWrap: "wrap",
  gap: "3",
  mb: "6"
});

const rowClass = css({
  cursor: "pointer",
  "&[data-active] td": { bg: "background.brand !important" },
  // Pixel's table sets a default cursor on every cell. Rows here are one line, so cells
  // centre vertically and names line up with the cells that have an icon or avatar.
  "& td": { cursor: "pointer", verticalAlign: "middle !important" },
  // The whole row opens the item, so its name turns into a link on hover.
  "&:hover [data-name], &:focus-visible [data-name]": {
    color: "text.selected",
    textDecoration: "underline"
  }
});
</script>
