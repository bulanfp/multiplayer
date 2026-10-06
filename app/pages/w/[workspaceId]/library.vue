<template>
  <div v-if="workspace" :class="pageClass">
    <PageHeader title="Library" :subtitle="`Outputs and files from ${workspace.name}`" />

    <PageContent :padded="false">
      <div :class="splitClass">
        <div :class="listPaneClass">
          <!-- ═════ Toolbar ═════ -->
          <MpFlex alignItems="flex-end" justifyContent="space-between" gap="4">
            <MpTabs id="library-tabs" v-model="tab" is-manual :has-margin-bottom="false">
              <MpTabList>
                <MpTab>All ({{ outputRows.length + fileRows.length }})</MpTab>
                <MpTab>Outputs ({{ outputRows.length }})</MpTab>
                <MpTab>Files ({{ fileRows.length }})</MpTab>
              </MpTabList>
            </MpTabs>
            <div :class="css({ w: '280px', flexShrink: '0', pb: '2' })">
              <SearchInput id="library-search" v-model="query" placeholder="Search the library" />
            </div>
          </MpFlex>

          <!-- ═════ Table ═════ -->
          <MpTableContainer v-if="rows.length" :class="css({ mt: '4' })">
            <MpTable>
              <MpTableHead>
                <MpTableRow>
                  <MpTableCell scope="col">Name</MpTableCell>
                  <MpTableCell scope="col">Type</MpTableCell>
                  <MpTableCell scope="col">Source</MpTableCell>
                  <MpTableCell scope="col">Updated by</MpTableCell>
                </MpTableRow>
              </MpTableHead>
              <MpTableBody>
                <MpTableRow
                  v-for="row in rows"
                  :key="row.id"
                  :class="rowClass"
                  :data-active="activeOutputId === row.id || undefined"
                  tabindex="0"
                  @click="openRow(row)"
                  @keydown.enter="openRow(row)"
                >
                  <MpTableCell as="td" scope="row">
                    <MpFlex alignItems="center" gap="2">
                      <MpIcon
                        :name="row.icon"
                        size="md"
                        :color="row.kind === 'output' ? 'icon.brand' : 'icon.default'"
                      />
                      <MpText weight="semiBold">{{ row.name }}</MpText>
                      <MpText v-if="row.version" size="label-small" color="text.secondary">
                        v{{ row.version }}
                      </MpText>
                    </MpFlex>
                  </MpTableCell>
                  <MpTableCell as="td" scope="row">{{ row.type }}</MpTableCell>
                  <MpTableCell as="td" scope="row">{{ row.source }}</MpTableCell>
                  <MpTableCell as="td" scope="row">
                    <MpFlex alignItems="center" gap="2">
                      <MemberAvatar :actor="row.actor" size="sm" />
                      <MpFlex direction="column">
                        <MpText>{{ actorName(row.actor) }}</MpText>
                        <MpText size="label-small" color="text.secondary">
                          {{ formatShortTimestamp(row.updatedAt) }}
                        </MpText>
                      </MpFlex>
                    </MpFlex>
                  </MpTableCell>
                </MpTableRow>
              </MpTableBody>
            </MpTable>
          </MpTableContainer>

          <MpFlex v-else direction="column" alignItems="center" gap="1" paddingY="10">
            <MpText weight="semiBold">
              {{ query.trim() ? `Nothing matches “${query.trim()}”` : "Nothing here yet" }}
            </MpText>
            <MpText color="text.secondary">
              Outputs your agents create and files your team shares show up here.
            </MpText>
          </MpFlex>
        </div>

        <!-- ═════ Canvas ═════ -->
        <SidePanelTransition>
          <OutputCanvas
            v-if="activeOutputId"
            :output-id="activeOutputId"
            :version="activeVersion"
            :source-label="activeSource"
            @close="activeOutputId = null"
            @update:version="activeVersion = $event"
          />
        </SidePanelTransition>
      </div>
    </PageContent>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import {
  css,
  MpFlex,
  MpIcon,
  MpTab,
  MpTabList,
  MpTable,
  MpTableBody,
  MpTableCell,
  MpTableContainer,
  MpTableHead,
  MpTableRow,
  MpTabs,
  MpText,
  type IconName
} from "@mekari/pixel3";
import SearchInput from "~/components/chat/SearchInput.vue";
import PageContent from "~/components/layout/PageContent.vue";
import PageHeader from "~/components/layout/PageHeader.vue";
import SidePanelTransition from "~/components/layout/SidePanelTransition.vue";
import MemberAvatar from "~/components/shared/MemberAvatar.vue";
import OutputCanvas from "~/components/thread/OutputCanvas.vue";
import { useChatStore } from "~/composables/useChatStore";
import { useCurrentWorkspace } from "~/composables/useCurrentWorkspace";
import { useWorkspaceStore } from "~/composables/useWorkspaceStore";
import type { Actor, LibraryFileType } from "~/data/types";
import { actorName } from "~/utils/directory";
import { formatShortTimestamp } from "~/utils/format";
import { conversationPath } from "~/utils/paths";

interface LibraryRowData {
  id: string;
  kind: "output" | "file";
  name: string;
  icon: IconName;
  type: string;
  source: string;
  actor: Actor;
  updatedAt: string;
  version?: number;
}

const FILE_TYPES: Record<LibraryFileType, { label: string; icon: IconName }> = {
  pdf: { label: "PDF", icon: "pdf" },
  image: { label: "Image", icon: "file-image" },
  zip: { label: "ZIP archive", icon: "zip" },
  design: { label: "Figma file", icon: "image-document" }
};

const { workspace } = useCurrentWorkspace();
const { outputsFor, filesFor, getOutput } = useChatStore();
const { getConversationById, conversationLabel } = useWorkspaceStore();

const tab = ref(0);
const query = ref("");
const activeOutputId = ref<string | null>(null);
const activeVersion = ref(1);

function sourceOf(threadId: string): string {
  const conversation = getConversationById(threadId);
  return conversation ? conversationLabel(conversation) : "—";
}

const outputRows = computed<LibraryRowData[]>(() =>
  workspace.value
    ? outputsFor(workspace.value.id).map((output) => {
        const latest = output.versions.at(-1)!;
        return {
          id: output.id,
          kind: "output",
          name: output.title,
          icon: "doc",
          type: output.kind,
          source: sourceOf(output.threadId),
          actor: { kind: "agent", id: latest.agentId },
          updatedAt: latest.createdAt,
          version: output.versions.length
        };
      })
    : []
);

const fileRows = computed<LibraryRowData[]>(() =>
  workspace.value
    ? filesFor(workspace.value.id).map((file) => ({
        id: file.id,
        kind: "file",
        name: file.name,
        icon: FILE_TYPES[file.type].icon,
        type: `${FILE_TYPES[file.type].label} · ${file.size}`,
        source: sourceOf(file.threadId),
        actor: { kind: "person", id: file.uploadedBy },
        updatedAt: file.uploadedAt
      }))
    : []
);

const rows = computed(() => {
  const needle = query.value.trim().toLowerCase();
  const byTab =
    [[...outputRows.value, ...fileRows.value], outputRows.value, fileRows.value][tab.value] ?? [];
  return byTab
    .filter((row) => !needle || row.name.toLowerCase().includes(needle))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
});

const activeSource = computed(() => {
  const output = activeOutputId.value ? getOutput(activeOutputId.value) : undefined;
  return output ? `from ${sourceOf(output.threadId)}` : undefined;
});

useHead({ title: "Library" });

// Files have no preview in the prototype, so they open the conversation they were shared in.
function openRow(row: LibraryRowData) {
  if (row.kind === "file") {
    const file = workspace.value
      ? filesFor(workspace.value.id).find((item) => item.id === row.id)
      : undefined;
    const conversation = file ? getConversationById(file.threadId) : undefined;
    if (workspace.value && conversation)
      navigateTo(conversationPath(workspace.value.id, conversation.slug));
    return;
  }
  activeOutputId.value = row.id;
  activeVersion.value = row.version ?? 1;
}

const pageClass = css({ display: "flex", flexDirection: "column", flex: "1", minH: "0" });

const splitClass = css({ display: "flex", h: "full", overflow: "hidden" });

const listPaneClass = css({ flex: "1", minW: "0", overflowY: "auto", p: "6" });

const rowClass = css({
  cursor: "pointer",
  "&[data-active] td": { bg: "background.brand !important" }
});
</script>
