<template>
  <aside :class="panelClass" :aria-label="TITLES[view]" style="--panel-offset: 328px">
    <!-- A conversation's side panel, for a group or an agent chat: Members (from the faces in
         the header), or Artifacts & files or Connectors (from the files pill's menu).
         320px wide plus its 8px left margin, so the slide starts fully off to the right. -->
    <!-- ═════ Members ═════ -->
    <template v-if="view === 'members'">
      <header :class="headerClass">
        <MpText size="h3">Members</MpText>
        <MpButton
          is-rounded
          variant="ghost"
          size="sm"
          left-icon="close"
          aria-label="Close members"
          @click="emit('close')"
        />
      </header>

      <div :class="bodyClass">
        <!-- Agent chats are yours alone: other agents join by being @mentioned -->
        <MpButton
          v-if="canEdit && !isAgentChat"
          is-rounded
          variant="secondary"
          left-icon="add"
          is-full-width
          @click="emit('add')"
        >
          Add people or agents
        </MpButton>

        <section>
          <MpText size="label-small" weight="semiBold" color="text.secondary" :class="labelClass">
            People ({{ conversation.memberIds.length }})
          </MpText>
          <ul>
            <li v-for="personId in conversation.memberIds" :key="personId" :class="rowClass">
              <MemberAvatar :actor="{ kind: 'person', id: personId }" />
              <MpFlex direction="column" minWidth="0">
                <MpText weight="semiBold" is-truncated>
                  {{ getPerson(personId)?.name }}{{ personId === CURRENT_USER_ID ? " (you)" : "" }}
                </MpText>
                <MpText size="label-small" color="text.secondary" is-truncated>
                  {{ getPerson(personId)?.title }}
                </MpText>
              </MpFlex>
            </li>
          </ul>
        </section>

        <section>
          <MpText size="label-small" weight="semiBold" color="text.secondary" :class="labelClass">
            Agents ({{ agentIds.length }})
          </MpText>
          <ul>
            <li v-for="agentId in agentIds" :key="agentId" :class="rowClass">
              <MemberAvatar :actor="{ kind: 'agent', id: agentId }" />
              <MpFlex direction="column" minWidth="0">
                <MpText weight="semiBold" is-truncated>{{ getAgent(agentId)?.name }}</MpText>
                <MpText size="label-small" color="text.secondary" is-truncated>
                  {{
                    consultedIds.includes(agentId)
                      ? `${getAgent(agentId)?.role} · consulted`
                      : getAgent(agentId)?.role
                  }}
                </MpText>
              </MpFlex>
            </li>
          </ul>
        </section>
      </div>
    </template>

    <!-- ═════ Artifacts & files, or Connectors (both from the files pill's menu) ═════ -->
    <template v-else>
      <header :class="headerClass">
        <MpText size="h3">{{ TITLES[view] }}</MpText>
        <MpButton
          is-rounded
          variant="ghost"
          size="sm"
          left-icon="close"
          :aria-label="`Close ${TITLES[view].toLowerCase()}`"
          @click="emit('close')"
        />
      </header>

      <div :class="sheetClass">
        <!-- Artifacts agents made here (or shared here), then files people attached; each
             section folds like the sidebar's, newest first -->
        <template v-if="view === 'files'">
          <SidebarSection
            v-for="group in fileGroups"
            :id="`panel-${group.id}`"
            :key="group.id"
            :label="`${group.label} (${group.items.length})`"
          >
            <template #default="{ isOpen }">
              <div v-show="isOpen" :class="sectionBodyClass">
                <ul v-if="group.items.length" :class="listClass">
                  <li v-for="item in group.items" :key="item.id">
                    <button
                      type="button"
                      :class="[rowClass, clickableRowClass]"
                      :aria-label="`Open ${item.name}`"
                      @click="openItem(item)"
                    >
                      <span :class="tileClass">
                        <MpIcon
                          :name="item.icon"
                          size="md"
                          :color="item.kind === 'output' ? 'icon.brand' : 'icon.default'"
                        />
                      </span>
                      <MpFlex direction="column" alignItems="flex-start" minWidth="0">
                        <MpText weight="semiBold" is-truncated :class="fullWidthClass">
                          {{ item.name }}
                        </MpText>
                        <MpText
                          size="label-small"
                          color="text.secondary"
                          is-truncated
                          :class="fullWidthClass"
                        >
                          {{ item.caption }}
                        </MpText>
                      </MpFlex>
                    </button>
                  </li>
                </ul>
                <MpText v-else color="text.secondary" :class="emptyClass">
                  {{ group.empty }}
                </MpText>
              </div>
            </template>
          </SidebarSection>
        </template>

        <!-- Apps this conversation's agents can use -->
        <template v-else>
          <ul v-if="connectors.length" :class="listClass">
            <li
              v-for="item in connectors"
              :key="item.id"
              class="group"
              :class="[rowClass, connectorRowClass]"
            >
              <ConnectorLogo :connector-id="item.id" />
              <MpFlex direction="column" flex="1" minWidth="0">
                <MpText weight="semiBold" is-truncated>{{ getConnector(item.id)?.name }}</MpText>
                <MpText size="label-small" color="text.secondary" is-truncated line-clamp="2">
                  {{
                    item.items.length ? item.items.join(", ") : getConnector(item.id)?.description
                  }}
                </MpText>
                <MpText size="label-small" color="text.secondary" is-truncated>
                  Connected by {{ getPerson(item.addedBy)?.name.split(" ")[0] ?? "someone" }},
                  {{ formatShortTimestamp(item.addedAt) }}
                </MpText>
              </MpFlex>
              <MpTooltip
                v-if="canEdit"
                :id="`disconnect-${item.id}-tooltip`"
                label="Disconnect"
                use-portal
              >
                <MpButton
                  is-rounded
                  variant="ghost"
                  size="sm"
                  left-icon="close"
                  :aria-label="`Disconnect ${getConnector(item.id)?.name}`"
                  :class="disconnectClass"
                  @click="disconnect(item.id)"
                />
              </MpTooltip>
            </li>
          </ul>
          <MpText v-else color="text.secondary" :class="emptyClass">
            Connect Figma, Google Docs or Google Chat so the agents here can use them.
          </MpText>

          <!-- Portaled: the panel clips its overflow -->
          <MpPopover
            v-if="canEdit && available.length"
            id="add-connector-menu"
            v-slot="{ onClosePopover }"
            placement="bottom-start"
            use-portal
            :is-keep-alive="false"
          >
            <MpPopoverTrigger>
              <MpButton
                is-rounded
                variant="secondary"
                left-icon="add"
                is-full-width
                :class="addButtonClass"
              >
                Add connector
              </MpButton>
            </MpPopoverTrigger>
            <MpPopoverContent :class="menuClass">
              <MpPopoverList :class="menuListClass">
                <MpPopoverListItem
                  v-for="connector in available"
                  :key="connector.id"
                  @click="connect(connector.id, onClosePopover)"
                >
                  <MpFlex alignItems="center" gap="3">
                    <ConnectorLogo :connector-id="connector.id" />
                    <MpFlex direction="column" minWidth="0">
                      <MpText weight="semiBold">{{ connector.name }}</MpText>
                      <MpText size="label-small" color="text.secondary">
                        {{ connector.description }}
                      </MpText>
                    </MpFlex>
                  </MpFlex>
                </MpPopoverListItem>
              </MpPopoverList>
            </MpPopoverContent>
          </MpPopover>
        </template>
      </div>
    </template>
  </aside>
</template>

<script setup lang="ts">
import { computed } from "vue";
import {
  css,
  toast,
  MpButton,
  MpFlex,
  MpIcon,
  MpPopover,
  MpPopoverContent,
  MpPopoverList,
  MpPopoverListItem,
  MpPopoverTrigger,
  MpText,
  MpTooltip
} from "@mekari/pixel3";
import SidebarSection from "~/components/layout/SidebarSection.vue";
import ConnectorLogo from "~/components/shared/ConnectorLogo.vue";
import MemberAvatar from "~/components/shared/MemberAvatar.vue";
import {
  useConversationDetails,
  type ConversationFile,
  type ConversationPanelView
} from "~/composables/useConversationDetails";
import { useWorkspaceStore } from "~/composables/useWorkspaceStore";
import { getAgent } from "~/data/agents";
import { CONNECTORS, getConnector } from "~/data/connectors";
import { CURRENT_USER_ID, getPerson } from "~/data/people";
import type { ConnectorId, Conversation } from "~/data/types";
import { formatShortTimestamp } from "~/utils/format";

interface ConversationSidePanelProps {
  conversation: Conversation;
  view: ConversationPanelView;
}

const TITLES: Record<ConversationPanelView, string> = {
  members: "Members",
  files: "Artifacts & files",
  connectors: "Connectors"
};

const props = defineProps<ConversationSidePanelProps>();
const emit = defineEmits<{
  close: [];
  add: [];
  openOutput: [outputId: string, version: number];
  openFile: [fileId: string];
}>();

const { filesIn, consultedIn, agentsIn } = useConversationDetails();
const { isMember, addConnector, removeConnector } = useWorkspaceStore();

/** Only people in the conversation add members or connect apps. */
const canEdit = computed(() => isMember(props.conversation));
const isAgentChat = computed(() => props.conversation.kind === "agent");

const agentIds = computed(() => agentsIn(props.conversation));
const consultedIds = computed(() => consultedIn(props.conversation));
const files = computed(() => filesIn(props.conversation));

/** Artifacts are what agents made (outputs that open in the canvas); files are attachments. */
const fileGroups = computed(() => [
  {
    id: "artifacts",
    label: "Artifacts",
    items: files.value.filter((item) => item.kind === "output"),
    empty: "Docs and plans agents write here show up here."
  },
  {
    id: "files",
    label: "Files",
    items: files.value.filter((item) => item.kind === "file"),
    empty: "Files people attach here show up here."
  }
]);

const connectors = computed(() => props.conversation.connectors ?? []);

/** Apps this conversation isn't connected to yet. */
const available = computed(() =>
  CONNECTORS.filter((connector) => !connectors.value.some((item) => item.id === connector.id))
);

function openItem(item: ConversationFile) {
  if (item.kind === "output") emit("openOutput", item.id, item.version ?? 1);
  else emit("openFile", item.id);
}

function connect(connectorId: ConnectorId, close: () => void) {
  close();
  addConnector(props.conversation, connectorId);
  toast.notify({ title: `${getConnector(connectorId)?.name} connected`, variant: "success" });
}

function disconnect(connectorId: ConnectorId) {
  removeConnector(props.conversation, connectorId);
  toast.notify({ title: `${getConnector(connectorId)?.name} disconnected`, variant: "success" });
}

// Same floating card as the output canvas.
const panelClass = css({
  display: "flex",
  flexDirection: "column",
  flexShrink: "0",
  w: "320px",
  m: "2",
  bg: "background.neutral",
  borderWidth: "1px",
  borderColor: "border.default",
  rounded: "xl",
  boxShadow: "0 1px 3px 0 token(colors.neutral.200a)",
  overflow: "hidden"
});

const headerClass = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  px: "5",
  py: "4",
  borderBottomWidth: "1px",
  borderColor: "border.default"
});

const bodyClass = css({
  display: "flex",
  flexDirection: "column",
  gap: "5",
  flex: "1",
  minH: "0",
  overflowY: "auto",
  px: "5",
  py: "4"
});

const labelClass = css({ textTransform: "uppercase", letterSpacing: "0.1em", mb: "1" });

// Sections sit 12px in, so their labels and rows (8px further in) line up with the title.
const sheetClass = css({
  display: "flex",
  flexDirection: "column",
  gap: "4",
  flex: "1",
  minH: "0",
  overflowY: "auto",
  px: "3",
  py: "4"
});

const sectionBodyClass = css({ display: "flex", flexDirection: "column", mt: "1" });

const emptyClass = css({ px: "2", py: "2" });

const addButtonClass = css({ mt: "2", mx: "2", w: "auto !important" });

const listClass = css({ display: "flex", flexDirection: "column", gap: "0.5" });

const rowClass = css({
  display: "flex",
  alignItems: "center",
  gap: "3",
  w: "full",
  py: "2",
  textAlign: "left"
});

// In the list's bleed, like the clickable file rows, so logos line up with the files' tiles.
const connectorRowClass = css({ px: "2" });

const clickableRowClass = css({
  px: "2",
  rounded: "md",
  cursor: "pointer",
  _hover: { bg: "background.neutral.hovered" },
  _focusVisible: { outline: "2px solid", outlineColor: "border.focused", outlineOffset: "-2px" }
});

const fullWidthClass = css({ maxW: "full" });

// Outputs and files on the same soft 32px tile as connector logos.
const tileClass = css({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: "0",
  w: "8",
  h: "8",
  rounded: "md",
  bg: "background.neutral.subtle"
});

// Shows while the pointer is over the connector, or keyboard focus is on the button.
const disconnectClass = css({
  flexShrink: "0",
  opacity: "0",
  transition: "opacity .15s ease",
  _groupHover: { opacity: "1" },
  _focusVisible: { opacity: "1" },
  _motionReduce: { transition: "none" }
});

const menuClass = css({ w: "300px" });

// Pixel's list pads 12px above and 8px below; 4px on both keeps the menu even.
const menuListClass = css({ py: "1" });
</script>
