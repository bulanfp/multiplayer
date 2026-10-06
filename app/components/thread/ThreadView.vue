<template>
  <div :class="rootClass">
    <div ref="scrollRef" :class="scrollClass" @scroll="handleScroll">
      <slot name="intro" />
      <div role="log" :aria-label="label" :class="listClass">
        <template v-for="item in items" :key="item.key">
          <div v-if="item.type === 'divider'" :class="dividerClass" role="separator">
            <MpText size="label-small" weight="semiBold" color="text.secondary" :class="pillClass">
              {{ item.label }}
            </MpText>
          </div>
          <ThreadMessageItem
            v-else
            :message="item.message"
            :is-continuation="item.isContinuation"
            :active-output="activeOutput"
            :can-answer="canPost"
            @open-output="(outputId, version) => emit('openOutput', outputId, version)"
            @pick="(messageId, optionId) => emit('pick', messageId, optionId)"
          />
        </template>
      </div>
      <ThreadTypingIndicator v-if="typing.length" :agent-ids="typing" />
    </div>

    <div :class="footerClass">
      <MessageComposer
        v-if="canPost"
        :id="`composer-${threadId}`"
        :key="threadId"
        :mentionables="mentionables"
        :placeholder="placeholder"
        @send="emit('send', $event)"
      />
      <slot v-else name="blocked" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { css, MpText } from "@mekari/pixel3";
import MessageComposer from "~/components/thread/MessageComposer.vue";
import ThreadMessageItem from "~/components/thread/ThreadMessageItem.vue";
import ThreadTypingIndicator from "~/components/thread/ThreadTypingIndicator.vue";
import { useChatStore } from "~/composables/useChatStore";
import type { Mention, Message } from "~/data/types";
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
  | { type: "message"; key: string; message: Message; isContinuation: boolean };

const props = withDefaults(defineProps<ThreadViewProps>(), { canPost: true, activeOutput: null });
const emit = defineEmits<{
  send: [payload: { text: string; mentions: Mention[] }];
  openOutput: [outputId: string, version: number];
  pick: [messageId: string, optionId: string];
}>();

const GROUP_WINDOW_MS = 5 * 60_000;
/** Within this many pixels of the end counts as "reading the newest messages". */
const PIN_THRESHOLD = 48;

const { messagesFor, typingIn } = useChatStore();

const scrollRef = ref<HTMLElement | null>(null);
const isPinned = ref(true);

const messages = computed(() => messagesFor(props.threadId));
const typing = computed(() => typingIn(props.threadId));

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
    const isContinuation =
      Boolean(previous) &&
      previous!.kind === "message" &&
      message.kind === "message" &&
      previous!.sender.id === message.sender.id &&
      isSameDay(previous!.createdAt, message.createdAt) &&
      Date.parse(message.createdAt) - Date.parse(previous!.createdAt) < GROUP_WINDOW_MS;
    result.push({ type: "message", key: message.id, message, isContinuation });
  });
  return result;
});

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

// Extra room at the end so the newest message clears the fade above the composer.
const scrollClass = css({ flex: "1", minH: "0", overflowY: "auto", pt: "4", pb: "8" });

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

// Messages scrolling under the composer fade into a soft white blur, not a hard edge.
const footerClass = css({
  position: "relative",
  px: "6",
  pt: "2",
  pb: "5",
  _before: {
    content: '""',
    position: "absolute",
    left: "0",
    right: "0",
    bottom: "100%",
    h: "10",
    pointerEvents: "none",
    bg: "linear-gradient(to bottom, transparent, token(colors.background.neutral))",
    backdropFilter: "blur(3px)",
    maskImage: "linear-gradient(to bottom, transparent, black 70%)"
  }
});
</script>
