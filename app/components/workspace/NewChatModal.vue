<template>
  <MpModal
    id="new-chat-modal"
    :is-open="isOpen"
    size="md"
    scroll-behavior="auto"
    @close="handleClose"
  >
    <MpModalContent>
      <MpModalHeader>
        Chat with an agent
        <MpModalCloseButton is-rounded aria-label="Close" />
      </MpModalHeader>
      <MpModalBody>
        <SearchInput id="new-chat-search" v-model="query" placeholder="Search agents" />

        <!-- ═════ Agents; picking one starts a new chat with it ═════ -->
        <ul v-if="agents.length" :class="listClass" aria-label="Agents">
          <li v-for="agent in agents" :key="agent.id">
            <button type="button" :class="rowClass" @click="openChat(agent.id)">
              <MemberAvatar :actor="{ kind: 'agent', id: agent.id }" />
              <MpFlex direction="column" alignItems="flex-start" flex="1" minWidth="0">
                <MpText weight="semiBold" is-truncated>{{ agent.name }}</MpText>
                <MpText size="label-small" color="text.secondary" is-truncated>
                  {{ agent.description }}
                </MpText>
              </MpFlex>
              <MpText
                v-if="chatCount(agent.id)"
                size="label-small"
                color="text.secondary"
                :class="css({ flexShrink: '0' })"
              >
                {{ chatCount(agent.id) }} {{ chatCount(agent.id) === 1 ? "chat" : "chats" }}
              </MpText>
            </button>
          </li>
        </ul>

        <MpText v-else color="text.secondary" :class="css({ py: '4' })">
          No agent matches “{{ query.trim() }}”.
        </MpText>
      </MpModalBody>
    </MpModalContent>
    <MpModalOverlay />
  </MpModal>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import {
  css,
  MpFlex,
  MpModal,
  MpModalBody,
  MpModalCloseButton,
  MpModalContent,
  MpModalHeader,
  MpModalOverlay,
  MpText
} from "@mekari/pixel3";
import SearchInput from "~/components/chat/SearchInput.vue";
import MemberAvatar from "~/components/shared/MemberAvatar.vue";
import { useWorkspaceStore } from "~/composables/useWorkspaceStore";
import { getAgent } from "~/data/agents";
import type { Agent, Workspace } from "~/data/types";
import { newAgentChatRoute } from "~/utils/paths";

interface NewChatModalProps {
  isOpen: boolean;
  workspace: Workspace;
}

const props = defineProps<NewChatModalProps>();
const emit = defineEmits<{ close: [] }>();

const { chatsWith } = useWorkspaceStore();

const query = ref("");

const agents = computed(() => {
  const needle = query.value.trim().toLowerCase();
  return props.workspace.agentIds
    .map((id) => getAgent(id))
    .filter((agent): agent is Agent => Boolean(agent))
    .filter(
      (agent) =>
        !needle ||
        agent.name.toLowerCase().includes(needle) ||
        agent.description.toLowerCase().includes(needle)
    );
});

/** How many chats you already have with an agent; they're listed on its page. */
function chatCount(agentId: string): number {
  return chatsWith(props.workspace.id, agentId).length;
}

function handleClose() {
  query.value = "";
  emit("close");
}

function openChat(agentId: string) {
  handleClose();
  navigateTo(newAgentChatRoute(props.workspace.id, agentId));
}

const listClass = css({ display: "flex", flexDirection: "column", gap: "0.5", mt: "3" });

const rowClass = css({
  display: "flex",
  alignItems: "center",
  gap: "3",
  w: "full",
  px: "2",
  py: "2",
  rounded: "md",
  textAlign: "left",
  cursor: "pointer",
  _hover: { bg: "background.neutral.hovered" },
  _focusVisible: { outline: "2px solid", outlineColor: "border.focused", outlineOffset: "-2px" }
});
</script>
