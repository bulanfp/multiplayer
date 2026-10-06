<template>
  <aside :class="panelClass" aria-label="Chat history">
    <SearchInput id="chat-history-search" v-model="query" :placeholder="SEARCH_PLACEHOLDER" />

    <div :class="sectionsClass">
      <section v-for="(group, index) in visibleGroups" :key="group.label" :class="sectionClass">
        <SectionLabel>{{ group.label }}</SectionLabel>

        <ul :class="listClass">
          <li v-if="index === 0 && !isSearching">
            <button type="button" :class="newChatClass" @click="emit('newChat')">
              <MpIcon name="add" size="md" color="icon.default" />
              <MpText>{{ NEW_CHAT_LABEL }}</MpText>
            </button>
          </li>
          <li v-for="chat in group.chats" :key="chat.id">
            <ChatHistoryItem
              :title="chat.title"
              :is-active="chat.id === activeChatId"
              @select="emit('select', chat.id)"
            />
          </li>
        </ul>
      </section>

      <MpText
        v-if="isSearching && !visibleGroups.length"
        color="text.secondary"
        :class="css({ px: '2' })"
      >
        No chats match “{{ query.trim() }}”.
      </MpText>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { css, MpIcon, MpText } from "@mekari/pixel3";
import ChatHistoryItem from "~/components/chat/ChatHistoryItem.vue";
import SearchInput from "~/components/chat/SearchInput.vue";
import SectionLabel from "~/components/layout/SectionLabel.vue";
import type { ChatHistoryGroup } from "~/data/types";

const SEARCH_PLACEHOLDER = "Search chats";
const NEW_CHAT_LABEL = "New chat";

interface ChatHistoryPanelProps {
  /** Chats grouped by recency */
  groups: ChatHistoryGroup[];
  /** Id of the open chat, null for a new one */
  activeChatId?: string | null;
}

const props = defineProps<ChatHistoryPanelProps>();
const emit = defineEmits<{ select: [chatId: string]; newChat: [] }>();

const query = ref("");
const isSearching = computed(() => query.value.trim().length > 0);

const visibleGroups = computed(() => {
  const needle = query.value.trim().toLowerCase();
  if (!needle) return props.groups;
  return props.groups
    .map((group) => ({
      ...group,
      chats: group.chats.filter((chat) => chat.title.toLowerCase().includes(needle))
    }))
    .filter((group) => group.chats.length);
});

const panelClass = css({
  display: "flex",
  flexDirection: "column",
  gap: "6",
  flexShrink: "0",
  w: "280px",
  h: "full",
  overflowY: "auto",
  pt: "3",
  px: "3",
  pb: "6",
  borderRightWidth: "1px",
  borderColor: "border.default"
});

const sectionsClass = css({ display: "flex", flexDirection: "column", gap: "6" });

// 4px top offset + 12px gap centre the label where the design puts it.
const sectionClass = css({ display: "flex", flexDirection: "column", gap: "3", pt: "1" });

const listClass = css({ display: "flex", flexDirection: "column" });

// Icon sits 4px further left than the chat bullets, as in the design.
const newChatClass = css({
  display: "flex",
  alignItems: "center",
  gap: "1.5",
  w: "full",
  h: "34px",
  px: "1",
  rounded: "md",
  textAlign: "left",
  cursor: "pointer",
  _hover: { bg: "background.neutral.hovered" },
  _focusVisible: { outline: "2px solid", outlineColor: "border.focused", outlineOffset: "-2px" }
});
</script>
