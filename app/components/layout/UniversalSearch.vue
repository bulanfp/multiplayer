<template>
  <!-- Pixel's enterprise layout universal search (ai.mekari.design/blocks/enterprise-layout-default):
       the field, "Search in:" scopes, an ask-AI row, results grouped by kind, and key hints.
       Agents open your chat with them, and the AI row opens Airene. -->
  <MpModal
    id="universal-search"
    :is-open="isOpen"
    size="lg"
    scroll-behavior="auto"
    @close="handleClose"
  >
    <MpModalContent :class="contentClass">
      <div :class="panelClass" @keydown="handleKeydown">
        <div :class="fieldClass">
          <MpIcon name="search" size="sm" color="icon.default" />
          <input
            ref="inputRef"
            v-model="query"
            type="text"
            role="combobox"
            aria-label="Search"
            aria-autocomplete="list"
            aria-expanded="true"
            aria-controls="universal-search-results"
            :aria-activedescendant="activeItem ? optionId(activeItem) : undefined"
            :placeholder="placeholder"
            :class="inputClass"
          />
          <button v-if="query" type="button" :class="clearClass" @click="clearQuery">Clear</button>
        </div>

        <div v-if="workspace" :class="scopesClass">
          <MpText size="label" weight="semiBold" :class="css({ flexShrink: '0' })">
            Search in:
          </MpText>
          <div :class="scopeListClass">
            <button
              v-for="option in SCOPES"
              :key="option.id"
              type="button"
              :class="scopeClass"
              :aria-pressed="scope === option.id"
              :data-active="scope === option.id || undefined"
              @click="setScope(option.id)"
            >
              {{ option.label }}
            </button>
          </div>
        </div>

        <div v-if="workspace" :class="css({ px: '4', py: '3' })">
          <button type="button" :class="askClass" @click="askAirene">
            <span :class="askContentClass">
              <MpIcon name="airene-brand" size="sm" />
              <MpText as="span" size="label" color="text.secondary">
                or ask Airene anything
              </MpText>
            </span>
            <span :class="askContentClass">
              <MpText as="span" size="label" color="text.selected">Try now</MpText>
              <MpIcon name="chevrons-right" size="sm" color="text.default" />
            </span>
          </button>
        </div>

        <div
          id="universal-search-results"
          role="listbox"
          aria-label="Results"
          :class="resultsClass"
        >
          <div
            v-for="section in sections"
            :key="section.id"
            role="group"
            :aria-labelledby="`universal-search-${section.id}`"
            :class="sectionClass"
          >
            <MpText :id="`universal-search-${section.id}`" weight="semiBold" :class="headingClass">
              {{ section.label }}
            </MpText>
            <button
              v-for="item in section.items"
              :id="optionId(item)"
              :key="item.id"
              type="button"
              role="option"
              tabindex="-1"
              :aria-selected="item.index === activeIndex"
              :data-active="item.index === activeIndex || undefined"
              :class="itemClass"
              @mousemove="activeIndex = item.index"
              @click="select(item)"
            >
              <span :class="leadingClass">
                <span v-if="item.emoji" :class="emojiClass" aria-hidden="true">
                  {{ item.emoji }}
                </span>
                <MemberAvatar v-else-if="item.actor" :actor="item.actor" size="sm" />
                <MpIcon
                  v-else-if="item.icon"
                  :name="item.icon"
                  size="sm"
                  :color="item.isOutput ? 'icon.brand' : 'icon.default'"
                />
              </span>
              <MpText as="span" is-truncated :class="nameClass">
                <template v-for="(part, i) in highlight(item.name)" :key="i">
                  <mark v-if="part.match" :class="markClass">{{ part.text }}</mark>
                  <template v-else>{{ part.text }}</template>
                </template>
              </MpText>
              <MpText
                v-if="item.caption"
                as="span"
                size="body-small"
                color="text.secondary"
                is-truncated
                :class="captionClass"
              >
                {{ item.caption }}
              </MpText>
            </button>
          </div>

          <MpText v-if="!sections.length" color="text.secondary" :class="emptyClass">
            No results found.
          </MpText>
        </div>

        <div :class="footerClass" aria-hidden="true">
          <span :class="hintClass">
            <kbd :class="kbdClass">↑↓</kbd>
            <MpText size="label-small" color="text.secondary">to move</MpText>
          </span>
          <span :class="hintClass">
            <kbd :class="kbdClass">↵</kbd>
            <MpText size="label-small" color="text.secondary">to open</MpText>
          </span>
          <span :class="hintClass">
            <kbd :class="kbdClass">ESC</kbd>
            <MpText size="label-small" color="text.secondary">to close</MpText>
          </span>
        </div>
      </div>
    </MpModalContent>
    <MpModalOverlay />
  </MpModal>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import {
  css,
  MpIcon,
  MpModal,
  MpModalContent,
  MpModalOverlay,
  MpText,
  type IconName
} from "@mekari/pixel3";
import MemberAvatar from "~/components/shared/MemberAvatar.vue";
import { useChatStore } from "~/composables/useChatStore";
import { useCurrentWorkspace } from "~/composables/useCurrentWorkspace";
import { useWorkspaceStore } from "~/composables/useWorkspaceStore";
import { AIRENE_ID, getAgent } from "~/data/agents";
import type { Actor } from "~/data/types";
import { FILE_TYPES } from "~/utils/files";
import { agentChatPath, conversationPath, threadPath } from "~/utils/paths";

interface UniversalSearchProps {
  isOpen: boolean;
}

const props = defineProps<UniversalSearchProps>();
const emit = defineEmits<{ close: [] }>();

interface SearchResult {
  /** Unique across sections: the section id, then the record's id */
  id: string;
  name: string;
  caption?: string;
  /** A group's emoji */
  emoji?: string;
  /** A person's or agent's avatar */
  actor?: Actor;
  icon?: IconName;
  /** Outputs take the brand colour, as in the Library */
  isOutput?: boolean;
  /** Where the result goes; an agent opens your chat with it */
  open: () => void;
}

type SectionId = "groups" | "agents" | "chats" | "library";
type Scope = "all" | SectionId;

interface SearchSection {
  id: SectionId;
  label: string;
  items: SearchResult[];
}

const SCOPES: { id: Scope; label: string }[] = [
  { id: "all", label: "All" },
  { id: "groups", label: "Groups" },
  { id: "agents", label: "Agents" },
  { id: "chats", label: "Your chats" },
  { id: "library", label: "Library" }
];

/** Per section: suggestions before you type, matches after, and everything in one scope. */
const SUGGESTION_LIMIT = 3;
const MATCH_LIMIT = 5;
const SCOPED_LIMIT = 20;

const { workspace } = useCurrentWorkspace();
const { channelsIn, isMember, chatsWith, agentChatsIn, agentOf, getConversationById } =
  useWorkspaceStore();
const { outputsFor, filesFor } = useChatStore();

const query = ref("");
const scope = ref<Scope>("all");
const activeIndex = ref(0);
const inputRef = ref<HTMLInputElement | null>(null);

const placeholder = "Search groups, agents, chats and files";

/** Everything you can jump to, before filtering. */
const candidates = computed<SearchSection[]>(() => {
  const project = workspace.value;
  if (!project) return [];

  const groups = [...channelsIn(project.id)]
    .sort((a, b) => Number(isMember(b)) - Number(isMember(a)))
    .map<SearchResult>((group) => ({
      id: `groups-${group.id}`,
      name: group.name,
      caption: isMember(group) ? group.description : "Not joined",
      emoji: group.emoji,
      open: () => navigateTo(conversationPath(project.id, group.slug))
    }));

  const agents = project.agentIds.flatMap<SearchResult>((agentId) => {
    const agent = getAgent(agentId);
    if (!agent) return [];
    return [
      {
        id: `agents-${agent.id}`,
        name: agent.name,
        caption: chatsWith(project.id, agent.id).length
          ? `${agent.role} · In your chats`
          : agent.role,
        actor: { kind: "agent", id: agent.id },
        open: () => navigateTo(agentChatPath(project.id, agent.id))
      }
    ];
  });

  // Your private chats with agents, by title; newest first.
  const chats = agentChatsIn(project.id).map<SearchResult>((chat) => {
    const agent = agentOf(chat);
    return {
      id: `chats-${chat.id}`,
      name: chat.name,
      caption: agent ? `Chat with ${agent.name}` : undefined,
      actor: agent ? { kind: "agent", id: agent.id } : undefined,
      open: () => navigateTo(threadPath(project.id, chat))
    };
  });

  return [
    { id: "groups", label: "Groups", items: groups },
    { id: "agents", label: "Agents", items: agents },
    { id: "chats", label: "Your chats", items: chats },
    { id: "library", label: "Library", items: libraryItems(project.id) }
  ];
});

/**
 * What the Library lists, newest first: outputs open in the group they're shared in, files in
 * the group they were attached to. Your private agent chats stay out, as there.
 */
function libraryItems(projectId: string): SearchResult[] {
  const visible = (threadId: string | undefined) => {
    const conversation = threadId ? getConversationById(threadId) : undefined;
    return conversation && conversation.kind === "channel" ? conversation : undefined;
  };

  const outputs = outputsFor(projectId).flatMap((output) => {
    const conversation = visible(output.threadId) ?? visible(output.sharedThreadIds?.[0]);
    if (!conversation) return [];
    const latest = output.versions.at(-1)!;
    return [
      {
        updatedAt: latest.createdAt,
        item: {
          id: `library-${output.id}`,
          name: output.title,
          caption: `${output.kind} · v${output.versions.length}`,
          icon: "doc" as IconName,
          isOutput: true,
          open: () =>
            navigateTo({
              path: conversationPath(projectId, conversation.slug),
              query: { output: output.id }
            })
        }
      }
    ];
  });

  const files = filesFor(projectId).flatMap((file) => {
    const conversation = visible(file.threadId);
    if (!conversation) return [];
    return [
      {
        updatedAt: file.uploadedAt,
        item: {
          id: `library-${file.id}`,
          name: file.name,
          caption: `${FILE_TYPES[file.type].label} · ${file.size}`,
          icon: FILE_TYPES[file.type].icon,
          open: () => navigateTo(conversationPath(projectId, conversation.slug))
        }
      }
    ];
  });

  return [...outputs, ...files]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .map(({ item }) => item);
}

/** Lower is better: the name starts with it, a word in it does, it's in the name, the caption. */
function rank(item: SearchResult, needle: string): number {
  const name = item.name.toLowerCase();
  if (name.startsWith(needle)) return 0;
  if (name.includes(` ${needle}`)) return 1;
  if (name.includes(needle)) return 2;
  if (item.caption?.toLowerCase().includes(needle)) return 3;
  return -1;
}

/** The sections with results in the current scope, each item numbered for the arrow keys. */
const sections = computed(() => {
  const needle = query.value.trim().toLowerCase();
  const limit = scope.value !== "all" ? SCOPED_LIMIT : needle ? MATCH_LIMIT : SUGGESTION_LIMIT;
  let index = 0;
  return candidates.value
    .filter((section) => scope.value === "all" || section.id === scope.value)
    .map((section) => {
      const items = needle
        ? section.items
            .map((item) => ({ item, rank: rank(item, needle) }))
            .filter((entry) => entry.rank >= 0)
            .sort((a, b) => a.rank - b.rank)
            .map((entry) => entry.item)
        : section.items;
      return { ...section, items: items.slice(0, limit) };
    })
    .filter((section) => section.items.length)
    .map((section) => ({
      ...section,
      items: section.items.map((item) => ({ ...item, index: index++ }))
    }));
});

const results = computed(() => sections.value.flatMap((section) => section.items));
const activeItem = computed(() => results.value[activeIndex.value]);

/** "Mobile dev" for "dev": [{ "Mobile ", false }, { "dev", true }]. Rendered as text, never HTML. */
function highlight(text: string): { text: string; match: boolean }[] {
  const needle = query.value.trim().toLowerCase();
  if (!needle) return [{ text, match: false }];
  const haystack = text.toLowerCase();
  const parts: { text: string; match: boolean }[] = [];
  let from = 0;
  for (let at = haystack.indexOf(needle); at !== -1; at = haystack.indexOf(needle, from)) {
    if (at > from) parts.push({ text: text.slice(from, at), match: false });
    parts.push({ text: text.slice(at, at + needle.length), match: true });
    from = at + needle.length;
  }
  if (from < text.length) parts.push({ text: text.slice(from), match: false });
  return parts;
}

function optionId(item: SearchResult): string {
  return `universal-search-option-${item.id}`;
}

// The first result is ready for Enter whenever the results change.
watch([query, scope], () => {
  activeIndex.value = 0;
});

watch(activeIndex, async () => {
  await nextTick();
  if (activeItem.value) {
    document.getElementById(optionId(activeItem.value))?.scrollIntoView({ block: "nearest" });
  }
});

watch(
  () => props.isOpen,
  async (isOpen) => {
    if (!isOpen) return;
    activeIndex.value = 0;
    await nextTick();
    inputRef.value?.focus();
  }
);

function handleKeydown(event: KeyboardEvent) {
  if (event.key === "ArrowDown") {
    event.preventDefault();
    activeIndex.value = Math.min(activeIndex.value + 1, results.value.length - 1);
  } else if (event.key === "ArrowUp") {
    event.preventDefault();
    activeIndex.value = Math.max(activeIndex.value - 1, 0);
  } else if (event.key === "Enter" && activeItem.value) {
    event.preventDefault();
    select(activeItem.value);
  }
}

function setScope(value: Scope) {
  scope.value = value;
  inputRef.value?.focus();
}

function clearQuery() {
  query.value = "";
  inputRef.value?.focus();
}

function handleClose() {
  query.value = "";
  scope.value = "all";
  emit("close");
}

function select(item: SearchResult) {
  handleClose();
  item.open();
}

/** A new Airene chat, the project's AI. */
function askAirene() {
  const project = workspace.value;
  handleClose();
  if (project) navigateTo(agentChatPath(project.id, AIRENE_ID));
}

// The block's 536px. MpModal writes its size as an inline max-width, so this needs !important.
const contentClass = css({ maxW: "536px !important", rounded: "xl", overflow: "hidden" });

const panelClass = css({
  display: "flex",
  flexDirection: "column",
  maxH: "min(640px, calc(100vh - 160px))"
});

const fieldClass = css({ display: "flex", alignItems: "center", gap: "3", px: "4", py: "3" });

const inputClass = css({
  flex: "1",
  minW: "0",
  fontSize: "md",
  color: "text.default",
  bg: "transparent",
  outline: "none",
  _placeholder: { color: "text.placeholder" }
});

const clearClass = css({
  flexShrink: "0",
  fontSize: "sm",
  color: "text.secondary",
  cursor: "pointer",
  rounded: "sm",
  _hover: { color: "text.selected" },
  _focusVisible: { outline: "2px solid", outlineColor: "border.focused", outlineOffset: "2px" }
});

const scopesClass = css({
  display: "flex",
  alignItems: "center",
  gap: "2",
  px: "4",
  py: "2",
  borderBottomWidth: "1px",
  borderColor: "border.default"
});

const scopeListClass = css({ display: "flex", alignItems: "center", gap: "1", overflowX: "auto" });

// Pixel's scope chips: the selected one is solid brand, the rest quiet gray.
const scopeClass = css({
  px: "1.5",
  py: "0.5",
  rounded: "full",
  cursor: "pointer",
  whiteSpace: "nowrap",
  fontSize: "sm",
  color: "text.secondary",
  bg: "background.neutral.subtle",
  "&:not([data-active]):hover": { bg: "background.neutral.subtle.hovered" },
  _focusVisible: { outline: "2px solid", outlineColor: "border.focused", outlineOffset: "1px" },
  "&[data-active]": { bg: "background.brand.bold", color: "text.inverse" }
});

// Pixel's block paints this row a raw light blue; Pixel's own AI background is the token.
const askClass = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  w: "full",
  px: "3",
  py: "2",
  rounded: "md",
  bg: "background.airene",
  cursor: "pointer",
  _hover: { bg: "background.highlight.hovered" },
  _focusVisible: { outline: "2px solid", outlineColor: "border.focused", outlineOffset: "2px" }
});

const askContentClass = css({ display: "flex", alignItems: "center", gap: "1.5" });

const resultsClass = css({ flex: "1", minH: "0", overflowY: "auto" });

const sectionClass = css({ px: "2", py: "2" });

// Lines up with the result names' 12px inset, 20px from the panel's edge as in Pixel.
const headingClass = css({ display: "block", px: "3", mb: "2" });

const itemClass = css({
  display: "flex",
  alignItems: "center",
  gap: "2",
  w: "full",
  px: "3",
  py: "1.5",
  rounded: "md",
  textAlign: "left",
  cursor: "pointer",
  "&[data-active]": { bg: "background.neutral.hovered" }
});

// The 24px column that emoji, avatars and file icons share.
const leadingClass = css({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: "0",
  w: "6",
  h: "6"
});

const emojiClass = css({ fontSize: "lg", lineHeight: "1" });

const nameClass = css({ flexShrink: "1", minW: "0" });

const markClass = css({ bg: "transparent", color: "inherit", fontWeight: "semiBold" });

const captionClass = css({ flex: "1", minW: "0", ml: "1" });

const emptyClass = css({ display: "block", px: "4", py: "4" });

const footerClass = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  gap: "4",
  px: "4",
  py: "2",
  borderTopWidth: "1px",
  borderColor: "border.default",
  bg: "background.neutral.subtle"
});

const hintClass = css({ display: "inline-flex", alignItems: "center", gap: "1" });

const kbdClass = css({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  px: "1",
  py: "0.5",
  fontFamily: "body",
  fontSize: "sm",
  fontWeight: "semiBold",
  color: "text.secondary",
  bg: "background.neutral.subtle"
});
</script>
