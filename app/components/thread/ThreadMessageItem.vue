<template>
  <div v-if="message.kind === 'system'" :class="systemClass">
    <MpText size="body-small" color="text.secondary">{{ message.text }}</MpText>
    <MpText size="label-small" color="text.secondary">· {{ formatTime(message.createdAt) }}</MpText>
  </div>

  <!-- Your own messages sit on the right in a bubble, as in an agent chat -->
  <article
    v-else-if="isMine"
    class="group"
    :class="mineRowClass"
    :data-continuation="isContinuation || undefined"
  >
    <div :class="mineBodyClass">
      <MpText
        v-if="!isContinuation"
        as="time"
        size="label-small"
        color="text.secondary"
        :datetime="message.createdAt"
      >
        {{ formatTime(message.createdAt) }}
      </MpText>
      <div v-if="message.text" :class="mineLineClass">
        <MpText
          v-if="isContinuation"
          size="label-small"
          color="text.secondary"
          :class="hoverTimeClass"
        >
          {{ formatTime(message.createdAt) }}
        </MpText>
        <div :class="bubbleClass" :data-continuation="isContinuation || undefined">
          <MessageText :text="message.text" :mentions="message.mentions" />
        </div>
      </div>
      <MessageFiles :file-ids="message.fileIds" />
      <OutputCard
        v-if="output && message.output"
        :output="output"
        :version="message.output.version"
        :is-active="
          activeOutput?.id === output.id && activeOutput.version === message.output.version
        "
        @open="emit('openOutput', output.id, message.output.version)"
      />
    </div>
    <div :class="gutterClass">
      <MemberAvatar v-if="!isContinuation" :actor="message.sender" />
    </div>
  </article>

  <article
    v-else
    class="group"
    :class="rowClass"
    :data-continuation="isContinuation || undefined"
    :data-consulted="isConsulted || undefined"
  >
    <div :class="gutterClass">
      <span v-if="!isContinuation" :class="[avatarClass, isHopping && 'intro-hop']">
        <MemberAvatar :actor="message.sender" />
        <span
          v-if="isHopping"
          class="intro-wave"
          aria-hidden="true"
          @animationend="isHopping = false"
        >
          👋
        </span>
      </span>
      <MpText v-else size="label-small" color="text.secondary" :class="gutterTimeClass">
        {{ formatTime(message.createdAt) }}
      </MpText>
    </div>

    <div :class="bodyClass">
      <div v-if="!isContinuation" :class="metaClass">
        <MpText weight="semiBold">{{ actorName(message.sender) }}</MpText>
        <MpBadge v-if="isAgent" for="tableStatus" type="information" size="sm" class="agent-badge">
          Agent
        </MpBadge>
        <MpText as="time" size="label-small" color="text.secondary" :datetime="message.createdAt">
          {{ formatTime(message.createdAt) }}
        </MpText>
      </div>
      <!-- Everyone's messages are bubbles too: theirs on the left, pointed next to the photo.
           People's are grey, agents' have Pixel's soft AI tint. -->
      <div
        v-if="message.text"
        :class="theirBubbleClass"
        :data-continuation="isContinuation || undefined"
        :data-agent="isAgent || undefined"
      >
        <MessageText :text="message.text" :mentions="message.mentions" />
      </div>

      <MessageFiles :file-ids="message.fileIds" />

      <MessageChoice
        v-if="message.choice"
        :choice="message.choice"
        :agent-name="actorName(message.sender)"
        :can-answer="canAnswer"
        @pick="emit('pick', message.id, $event)"
      />

      <OutputCard
        v-if="output && message.output"
        :output="output"
        :version="message.output.version"
        :is-active="
          activeOutput?.id === output.id && activeOutput.version === message.output.version
        "
        @open="emit('openOutput', output.id, message.output.version)"
      />
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { css, MpBadge, MpText } from "@mekari/pixel3";
import MemberAvatar from "~/components/shared/MemberAvatar.vue";
import MessageText from "~/components/thread/MessageText.vue";
import MessageChoice from "~/components/thread/MessageChoice.vue";
import MessageFiles from "~/components/thread/MessageFiles.vue";
import OutputCard from "~/components/thread/OutputCard.vue";
import { useChatStore } from "~/composables/useChatStore";
import { CURRENT_USER_ID } from "~/data/people";
import type { Message } from "~/data/types";
import { actorName } from "~/utils/directory";
import { formatTime } from "~/utils/format";
import { claimIntroHop } from "~/utils/intro-hops";

interface ThreadMessageItemProps {
  message: Message;
  /** Same sender as the previous message, a few minutes apart: hide avatar and name */
  isContinuation?: boolean;
  /** Output and version currently open in the canvas */
  activeOutput?: { id: string; version: number } | null;
  /** You can post here, so you can also answer an agent's options */
  canAnswer?: boolean;
  /** Another agent brought this one in: indented under the "Messages from …" label */
  isConsulted?: boolean;
}

const props = defineProps<ThreadMessageItemProps>();
const emit = defineEmits<{
  openOutput: [outputId: string, version: number];
  pick: [messageId: string, optionId: string];
}>();

const { getOutput } = useChatStore();

const isAgent = computed(() => props.message.sender.kind === "agent");
const isMine = computed(
  () => props.message.sender.kind === "person" && props.message.sender.id === CURRENT_USER_ID
);

// An agent's hello hops in the first time it's on screen, not again when you come back.
const isHopping = ref(Boolean(props.message.intro) && claimIntroHop(props.message.id));

const output = computed(() =>
  props.message.output ? getOutput(props.message.output.outputId) : undefined
);

// Bubbles stop short of the far side, so the two sides of the conversation stay apart.
const rowClass = css({
  display: "flex",
  gap: "3",
  pl: "6",
  pr: "20",
  pt: "4",
  pb: "1",
  "&[data-continuation]": { pt: "0.5" },
  // An agent answering another agent, on a thin rule under the "Messages from …" label.
  "&[data-consulted]": {
    ml: "6",
    pl: "4",
    borderLeftWidth: "2px",
    borderColor: "border.default"
  }
});

// Your messages: right-aligned, kept clear of the left edge so they read as yours.
const mineRowClass = css({
  display: "flex",
  justifyContent: "flex-end",
  gap: "3",
  pl: "20",
  pr: "6",
  pt: "4",
  pb: "1",
  "&[data-continuation]": { pt: "0.5" }
});

const mineBodyClass = css({
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-end",
  gap: "1",
  minW: "0"
});

const mineLineClass = css({ display: "flex", alignItems: "center", gap: "2", minW: "0" });

// As in an agent chat, the top corner next to your photo is pointed on the first bubble.
// Yours take the brand tint, so they stand apart from people's and agents'. Like every
// bubble, it wraps at about 80 characters so long messages are easy to read.
const bubbleClass = css({
  px: "4",
  py: "2.5",
  rounded: "16px",
  roundedTopRight: "0",
  bg: "background.brand",
  maxW: "min(600px, 100%)",
  minW: "0",
  "&[data-continuation]": { roundedTopRight: "16px" }
});

const gutterClass = css({
  display: "flex",
  justifyContent: "center",
  flexShrink: "0",
  w: "8",
  pt: "0.5"
});

// Holds the avatar and, during an intro, the waving hand perched on its top-right corner.
// Avatar-sized rather than stretched to the row, so the hop tilts from the avatar's base.
const avatarClass = css({ position: "relative", display: "inline-flex", alignSelf: "flex-start" });

// Continuations show their time only on hover, like Slack.
const hoverTimeClass = css({ opacity: "0", _groupHover: { opacity: "1" }, fontSize: "10px" });

// In the avatar's column, level with the bubble's text.
const gutterTimeClass = css({
  opacity: "0",
  _groupHover: { opacity: "1" },
  fontSize: "10px",
  mt: "2.5"
});

// Bubbles hug their text; cards and files below keep their own width.
const bodyClass = css({
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  flex: "1",
  minW: "0"
});

const metaClass = css({ display: "flex", alignItems: "center", gap: "2", mb: "1" });

// People: a grey a shade darker than the canvas. Agents: Pixel's AI tint, as on Airene.
const theirBubbleClass = css({
  px: "4",
  py: "2.5",
  rounded: "16px",
  roundedTopLeft: "0",
  bg: "background.neutral.subtle.hovered",
  maxW: "min(600px, 100%)",
  "&[data-continuation]": { roundedTopLeft: "16px" },
  "&[data-agent]": { bg: "background.airene" }
});

const systemClass = css({ display: "flex", alignItems: "center", gap: "2", px: "6", py: "2" });
</script>

<style scoped>
/* Now and then a soft sheen sweeps across the agent badge, so agents stand out in a busy thread. */
.agent-badge {
  position: relative;
  overflow: hidden;
}

/* A narrow, slanted band of light that rests just past either edge; it never takes clicks. */
.agent-badge::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(110deg, transparent 35%, rgb(255 255 255 / 65%) 50%, transparent 65%);
  transform: translateX(-80%);
  pointer-events: none;
  animation: agent-badge-shimmer 3.5s ease-in-out infinite;
}

/* About 1.2s to cross, then a rest before the next pass. */
@keyframes agent-badge-shimmer {
  0% {
    transform: translateX(-80%);
  }

  35%,
  100% {
    transform: translateX(80%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .agent-badge::after {
    animation: none;
  }
}

/*
 * A new agent's hello: its avatar crouches, takes a big tilted hop, a smaller one the other
 * way, and settles, while a hand pops up beside it and waves. Translate and rotate only, no
 * zoom; reduced motion keeps everything still and skips the hand.
 */
.intro-hop {
  transform-origin: 50% 100%;
  animation: intro-hop 1.2s cubic-bezier(0.3, 0, 0.3, 1) both;
}

@keyframes intro-hop {
  0%,
  78%,
  100% {
    transform: translateY(0) rotate(0);
  }

  12% {
    transform: translateY(2px) rotate(0);
  }

  32% {
    transform: translateY(-14px) rotate(-10deg);
  }

  50% {
    transform: translateY(0) rotate(0);
  }

  64% {
    transform: translateY(-6px) rotate(6deg);
  }
}

.intro-wave {
  position: absolute;
  top: -10px;
  right: -8px;
  font-size: 14px;
  line-height: 1;
  transform-origin: 70% 80%;
  pointer-events: none;
  animation: intro-wave 2s ease-in-out both;
}

@keyframes intro-wave {
  0% {
    opacity: 0;
    transform: translateY(4px) rotate(0);
  }

  15% {
    opacity: 1;
    transform: translateY(0) rotate(0);
  }

  25%,
  45% {
    transform: rotate(18deg);
  }

  35% {
    transform: rotate(-10deg);
  }

  55% {
    transform: rotate(-6deg);
  }

  65% {
    opacity: 1;
    transform: rotate(0);
  }

  100% {
    opacity: 0;
    transform: rotate(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .intro-hop {
    animation: none;
  }

  .intro-wave {
    display: none;
  }
}
</style>
