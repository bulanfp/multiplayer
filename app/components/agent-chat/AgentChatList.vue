<template>
  <!-- Your private chats with one agent, newest first, grouped by when you last used them -->
  <nav :class="rootClass" :aria-label="`Your chats with ${agentName}`">
    <SearchInput :id="`${agentId}-chat-search`" v-model="query" placeholder="Search" />

    <div v-for="group in groups" :key="group.key" :class="groupClass">
      <SectionLabel :id="`${agentId}-chats-${group.key}`">{{ group.label }}</SectionLabel>
      <ul :class="listClass" :aria-labelledby="`${agentId}-chats-${group.key}`">
        <!-- ═════ The chat you just started with New chat, until you send ═════ -->
        <li v-if="group.key === 'recent' && isNewChat">
          <NuxtLink
            :to="newAgentChatRoute(workspaceId, agentId)"
            :class="rowClass"
            aria-current="page"
            data-active
            @click="emit('new')"
          >
            <span :class="dotClass" />
            <MpText>New chat</MpText>
          </NuxtLink>
        </li>
        <li v-for="chat in group.chats" :key="chat.id">
          <NuxtLink
            :to="agentChatPath(workspaceId, agentId, chat.slug)"
            :class="rowClass"
            :aria-current="chat.slug === activeSlug ? 'page' : undefined"
            :data-active="chat.slug === activeSlug || undefined"
          >
            <!-- Filled when the agent wrote something you haven't read -->
            <span
              :class="dotClass"
              :data-unread="unreadCount(chat.id) > 0 || undefined"
              :aria-label="unreadCount(chat.id) ? 'Unread' : undefined"
              :role="unreadCount(chat.id) ? 'img' : undefined"
            />
            <MpText
              :weight="unreadCount(chat.id) ? 'semiBold' : 'regular'"
              is-truncated
              :class="css({ flex: '1', minW: '0' })"
            >
              {{ chat.name }}
            </MpText>
          </NuxtLink>
        </li>
      </ul>
    </div>

    <MpText v-if="query.trim() && !hasMatches" color="text.secondary" :class="css({ px: '2' })">
      No chats match “{{ query.trim() }}”
    </MpText>
  </nav>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { css, MpText } from "@mekari/pixel3";
import SearchInput from "~/components/chat/SearchInput.vue";
import SectionLabel from "~/components/layout/SectionLabel.vue";
import { useChatStore } from "~/composables/useChatStore";
import { getAgent } from "~/data/agents";
import type { Conversation } from "~/data/types";
import { agentChatPath, newAgentChatRoute } from "~/utils/paths";

interface AgentChatListProps {
  workspaceId: string;
  agentId: string;
  /** Your chats with the agent, newest first */
  chats: Conversation[];
  /** You started a new chat with New chat: a "New chat" row leads Recent */
  isNewChat?: boolean;
  /** The chat on screen */
  activeSlug?: string;
}

const props = defineProps<AgentChatListProps>();
const emit = defineEmits<{ new: [] }>();

const { lastMessageAt, unreadCount } = useChatStore();

const query = ref("");

const agentName = computed(() => getAgent(props.agentId)?.name ?? "this agent");

const DAY = 24 * 60 * 60 * 1000;

function startOfDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

const filtered = computed(() => {
  const needle = query.value.trim().toLowerCase();
  return props.chats.filter((chat) => !needle || chat.name.toLowerCase().includes(needle));
});

const hasMatches = computed(() => filtered.value.length > 0);

// Recent is today and yesterday. It shows even when empty while you start a new chat.
const groups = computed(() => {
  const today = startOfDay(new Date());
  const buckets = [
    { key: "recent", label: "Recent", chats: [] as Conversation[] },
    { key: "week", label: "This week", chats: [] as Conversation[] },
    { key: "older", label: "Older", chats: [] as Conversation[] }
  ];
  filtered.value.forEach((chat) => {
    const day = startOfDay(new Date(lastMessageAt(chat.id) ?? chat.createdAt));
    const index = day >= today - DAY ? 0 : day >= today - 7 * DAY ? 1 : 2;
    buckets[index]!.chats.push(chat);
  });
  return buckets.filter(
    (bucket) => bucket.chats.length || (bucket.key === "recent" && props.isNewChat)
  );
});

const rootClass = css({
  display: "flex",
  flexDirection: "column",
  gap: "6",
  w: "280px",
  flexShrink: "0",
  h: "full",
  overflowY: "auto",
  px: "3",
  py: "4",
  borderRightWidth: "1px",
  borderColor: "border.default"
});

const groupClass = css({ display: "flex", flexDirection: "column", gap: "1" });

const listClass = css({ display: "flex", flexDirection: "column", gap: "0.5" });

// Every row starts with its dot, so the titles line up.
const rowClass = css({
  display: "flex",
  alignItems: "center",
  gap: "2",
  px: "2",
  py: "2",
  rounded: "md",
  color: "text.default",
  textDecoration: "none",
  "&:not([data-active]):hover": { bg: "background.neutral.hovered" },
  "&[data-active]": { bg: "background.neutral.selected" },
  _focusVisible: { outline: "2px solid", outlineColor: "border.focused", outlineOffset: "-2px" }
});

// A small ring for chats you've read, filled with the brand green for unread ones.
const dotClass = css({
  flexShrink: "0",
  w: "6px",
  h: "6px",
  mx: "5px",
  rounded: "full",
  borderWidth: "1px",
  borderColor: "border.default",
  "&[data-unread]": { bg: "background.brand.bold", borderColor: "background.brand.bold" }
});
</script>
