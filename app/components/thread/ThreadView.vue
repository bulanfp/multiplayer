<template>
  <div :class="rootClass">
    <div
      ref="scrollRef"
      :class="scrollClass"
      :data-empty="isEmpty || undefined"
      @scroll="handleScroll"
    >
      <!-- Until the first message, the empty state fills the thread, centred -->
      <div v-if="isEmpty" :class="emptyClass">
        <slot name="empty" />
      </div>
      <slot name="intro" />
      <div role="log" :aria-label="label" :class="listClass">
        <template v-for="item in items" :key="item.key">
          <div v-if="item.type === 'divider'" :class="dividerClass" role="separator">
            <MpText size="label-small" weight="semiBold" color="text.secondary" :class="pillClass">
              {{ item.label }}
            </MpText>
          </div>
          <!-- Agents another agent brought in: one label over their answers -->
          <div v-else-if="item.type === 'consult'" :class="consultClass">
            <ConsultLabel :agent-ids="item.agentIds" />
          </div>
          <ThreadMessageItem
            v-else
            :message="item.message"
            :is-continuation="item.isContinuation"
            :is-consulted="Boolean(item.message.consultedBy)"
            :active-output="activeOutput"
            :can-answer="canPost"
            @open-output="(outputId, version) => emit('openOutput', outputId, version)"
            @pick="(messageId, optionId) => emit('pick', messageId, optionId)"
          />
        </template>
      </div>
      <ThreadTypingIndicator v-if="typing.length" :agent-ids="typing" />
      <div v-if="!isEmpty" :class="fadeClass" aria-hidden="true" />
    </div>

    <div :class="footerClass">
      <MessageComposer
        v-if="canPost"
        :id="`composer-${threadId}`"
        :key="threadId"
        :mentionables="mentionables"
        :placeholder="placeholder"
        :quote="shareDraftFor(threadId)"
        @send="emit('send', $event)"
        @remove-quote="clearShareDraft(threadId)"
      />
      <slot v-else name="blocked" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useSlots, watch } from "vue";
import { css, MpText } from "@mekari/pixel3";
import ConsultLabel from "~/components/thread/ConsultLabel.vue";
import MessageComposer from "~/components/thread/MessageComposer.vue";
import ThreadMessageItem from "~/components/thread/ThreadMessageItem.vue";
import ThreadTypingIndicator from "~/components/thread/ThreadTypingIndicator.vue";
import { useChatStore } from "~/composables/useChatStore";
import type { Message, MessageDraft } from "~/data/types";
import { formatDayLabel, isSameDay } from "~/utils/format";
import type { Mentionable } from "~/utils/mentions";

interface ThreadViewProps {
  threadId: string;
  /** Accessible name for the message log */
  label: string;
  mentionables: Mentionable[];
  placeholder: string;
  /** False shows the `blocked` slot (e.g. a Join bar) instead of the composer */
  canPost?: boolean;
  activeOutput?: { id: string; version: number } | null;
}

type ThreadItem =
  | { type: "divider"; key: string; label: string }
  | { type: "consult"; key: string; agentIds: string[] }
  | { type: "message"; key: string; message: Message; isContinuation: boolean };

const props = withDefaults(defineProps<ThreadViewProps>(), { canPost: true, activeOutput: null });
const emit = defineEmits<{
  send: [draft: MessageDraft];
  openOutput: [outputId: string, version: number];
  pick: [messageId: string, optionId: string];
}>();

const GROUP_WINDOW_MS = 5 * 60_000;
/** Within this many pixels of the end counts as "reading the newest messages". */
const PIN_THRESHOLD = 48;

const { messagesFor, typingIn, shareDraftFor, clearShareDraft } = useChatStore();

const scrollRef = ref<HTMLElement | null>(null);
const isPinned = ref(true);

const messages = computed(() => messagesFor(props.threadId));
const typing = computed(() => typingIn(props.threadId));

const slots = useSlots();
/** No messages yet and nobody typing: show the page's empty state, if it has one. */
const isEmpty = computed(
  () => Boolean(slots.empty) && !messages.value.length && !typing.value.length
);

const items = computed<ThreadItem[]>(() => {
  const result: ThreadItem[] = [];
  messages.value.forEach((message, index) => {
    const previous = messages.value[index - 1];
    if (!previous || !isSameDay(previous.createdAt, message.createdAt)) {
      result.push({
        type: "divider",
        key: `day-${message.id}`,
        label: formatDayLabel(message.createdAt)
      });
    }
    // Agents answering another agent's question get one "Messages from …" label for the run.
    if (message.consultedBy && previous?.consultedBy !== message.consultedBy) {
      result.push({
        type: "consult",
        key: `consult-${message.id}`,
        agentIds: consultedIn(index)
      });
    }
    const isContinuation =
      Boolean(previous) &&
      previous!.kind === "message" &&
      message.kind === "message" &&
      previous!.sender.id === message.sender.id &&
      previous!.consultedBy === message.consultedBy &&
      isSameDay(previous!.createdAt, message.createdAt) &&
      Date.parse(message.createdAt) - Date.parse(previous!.createdAt) < GROUP_WINDOW_MS;
    result.push({ type: "message", key: message.id, message, isContinuation });
  });
  return result;
});

/** Who answers in the consult run starting at `start`, in order, each once. */
function consultedIn(start: number): string[] {
  const by = messages.value[start]?.consultedBy;
  const agentIds: string[] = [];
  for (const message of messages.value.slice(start)) {
    if (message.consultedBy !== by) break;
    if (!agentIds.includes(message.sender.id)) agentIds.push(message.sender.id);
  }
  return agentIds;
}

function scrollToBottom(behavior: ScrollBehavior = "auto") {
  nextTick(() => scrollRef.value?.scrollTo({ top: scrollRef.value.scrollHeight, behavior }));
}

function handleScroll() {
  const element = scrollRef.value;
  if (!element) return;
  isPinned.value = element.scrollHeight - element.scrollTop - element.clientHeight < PIN_THRESHOLD;
}

watch(
  () => props.threadId,
  () => {
    isPinned.value = true;
    scrollToBottom();
  }
);
watch(
  () => [messages.value.length, typing.value.length],
  () => scrollToBottom("smooth")
);

// Opening or resizing the preview reflows the thread; stay on the newest messages if you were there.
let resizeObserver: ResizeObserver | undefined;

onMounted(() => {
  scrollToBottom();
  resizeObserver = new ResizeObserver(() => {
    if (isPinned.value) scrollToBottom();
  });
  if (scrollRef.value) resizeObserver.observe(scrollRef.value);
});

onBeforeUnmount(() => resizeObserver?.disconnect());

const rootClass = css({
  display: "flex",
  flexDirection: "column",
  flex: "1",
  minW: "0",
  h: "full"
});

// No bottom padding: the fade at the end of the list is the room the newest message needs.
const scrollClass = css({
  flex: "1",
  minH: "0",
  overflowY: "auto",
  pt: "4",
  // The empty state fills the thread exactly, so it's centred and nothing scrolls.
  "&[data-empty]": { display: "flex", flexDirection: "column", py: "0" }
});

// Messages scrolling under the composer fade into a soft white blur, not a hard edge. It's the
// list's last child, stuck to the bottom of the scroll area, so the browser paints the
// scrollbar over it instead of it blurring the scrollbar. Pulled up 8px, it adds the same 32px
// of room at the end as the padding it replaces.
const fadeClass = css({
  position: "sticky",
  bottom: "0",
  h: "10",
  mt: "-2",
  pointerEvents: "none",
  bg: "linear-gradient(to bottom, transparent, token(colors.background.neutral))",
  backdropFilter: "blur(3px)",
  maskImage: "linear-gradient(to bottom, transparent, black 70%)"
});

const emptyClass = css({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "2",
  flex: "1",
  px: "6",
  py: "10",
  textAlign: "center"
});

const listClass = css({ display: "flex", flexDirection: "column" });

const dividerClass = css({
  position: "relative",
  display: "flex",
  justifyContent: "center",
  my: "3",
  px: "6",
  _before: {
    content: '""',
    position: "absolute",
    top: "50%",
    left: "6",
    right: "6",
    borderTopWidth: "1px",
    borderColor: "border.default"
  }
});

const pillClass = css({
  position: "relative",
  px: "3",
  py: "0.5",
  bg: "background.neutral",
  rounded: "full",
  borderWidth: "1px",
  borderColor: "border.default"
});

const consultClass = css({ px: "6", pt: "4", pb: "1" });

const footerClass = css({ px: "6", pt: "2", pb: "5" });
</script>
