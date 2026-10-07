<template>
  <!-- An agent's 3D icon, brought to life. The eyes (and Airene's sparkle) sit on their own
       layers (scripts/split-agent-eyes.py), so the agent can look around, blink, lean and hop.
       Airene hovers over her shadow and twirls, as in Mekari Airene. Icons that weren't split
       stay still. -->
  <span
    v-if="agent && mascot"
    class="mascot"
    :data-motion="agent.id === 'airene' ? 'twirl' : 'play'"
    :style="vars"
    role="img"
    :aria-label="agent.name"
  >
    <span class="mascot-shadow" />
    <span class="mascot-float">
      <span class="mascot-move">
        <span class="mascot-turn">
          <img :src="mascot.body" alt="" draggable="false" />
          <!-- Clipped to the body, so eyes that turn away slip round its edge -->
          <span class="mascot-eyes">
            <span class="mascot-glance">
              <img class="mascot-blink" :src="mascot.eyes" alt="" draggable="false" />
            </span>
          </span>
        </span>
        <img
          v-if="mascot.extra"
          class="mascot-extra"
          :src="mascot.extra"
          alt=""
          draggable="false"
        />
      </span>
    </span>
  </span>
  <MemberAvatar v-else :actor="{ kind: 'agent', id: agentId }" size="xl" />
</template>

<script setup lang="ts">
import { computed } from "vue";
import MemberAvatar from "~/components/shared/MemberAvatar.vue";
import { MASCOT_GEOMETRY } from "~/data/agent-mascots";
import { getAgent } from "~/data/agents";

interface AgentMascotProps {
  agentId: string;
}

const props = defineProps<AgentMascotProps>();

const agent = computed(() => getAgent(props.agentId));

// The icon's layers, and where its parts sit, when its icon has been split.
const mascot = computed(() => {
  const name = agent.value?.icon?.match(/\/images\/agents\/([\w-]+)\.png$/)?.[1];
  const geometry = name ? MASCOT_GEOMETRY[name] : undefined;
  if (!name || !geometry) return undefined;
  return {
    ...geometry,
    body: `/images/agents/parts/${name}-body.png`,
    eyes: `/images/agents/parts/${name}-eyes.png`,
    extra: geometry.extraX === undefined ? undefined : `/images/agents/parts/${name}-extra.png`
  };
});

const vars = computed(() => {
  if (!mascot.value) return undefined;
  const { eyesX, eyesY, look, baseX, baseY, width, extraX, extraY, body } = mascot.value;
  return {
    "--eyes-x": `${eyesX}%`,
    "--eyes-y": `${eyesY}%`,
    "--look": `${look}%`,
    "--base-x": `${baseX}%`,
    "--base-y": `${baseY}%`,
    "--base-width": `${width}%`,
    "--extra-x": `${extraX ?? 50}%`,
    "--extra-y": `${extraY ?? 50}%`,
    "--body": `url("${body}")`
  };
});
</script>

<style scoped>
/* 64px, the size of MemberAvatar's xl. Every layer is the whole icon, stacked. */
.mascot {
  position: relative;
  display: inline-block;
  flex-shrink: 0;
  width: 64px;
  height: 64px;
}

.mascot img {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  user-select: none;
}

.mascot-float,
.mascot-move,
.mascot-turn,
.mascot-eyes,
.mascot-glance {
  position: absolute;
  inset: 0;
}

/* A soft shadow on the ground under the body: it shrinks and fades as the agent rises. */
.mascot-shadow {
  position: absolute;
  left: var(--base-x);
  top: var(--base-y);
  width: calc(var(--base-width) * 0.6);
  height: 10%;
  transform: translate(-50%, -50%);
}

.mascot-shadow::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: radial-gradient(closest-side, var(--mp-colors-background-shadow), transparent);
}

/* Stretches, squashes, leans and hops from the bottom of the body. */
.mascot-float,
.mascot-move {
  transform-origin: var(--base-x) var(--base-y);
}

/* Airene's turn narrows the body around its middle. */
.mascot-turn {
  transform-origin: var(--base-x) 50%;
}

.mascot-eyes {
  -webkit-mask: var(--body) center / 100% 100% no-repeat;
  mask: var(--body) center / 100% 100% no-repeat;
}

/* Glances and blinks happen around the middle of the eyes. */
.mascot-glance,
.mascot-blink {
  transform-origin: var(--eyes-x) var(--eyes-y);
}

.mascot-extra {
  transform-origin: var(--extra-x) var(--extra-y);
}

/* ═════ Agents: a 6s loop of hop, look left and right, blink, wiggle, always breathing ═════ */

.mascot[data-motion="play"] .mascot-float {
  animation: mascot-breathe 3s ease-in-out infinite;
}

.mascot[data-motion="play"] .mascot-move {
  animation: mascot-play 6s ease-in-out infinite;
}

.mascot[data-motion="play"] .mascot-glance {
  animation: mascot-play-eyes 6s ease-in-out infinite;
}

.mascot[data-motion="play"] .mascot-blink {
  animation: mascot-play-blink 6s linear infinite;
}

.mascot[data-motion="play"] .mascot-shadow::before {
  animation: mascot-play-shadow 6s ease-in-out infinite;
}

/* ═════ Airene: hovers over her shadow, twirls with a hop, dances, blinks; her sparkle twinkles ═════ */

/* Airene floats a little above her shadow even when nothing moves. */
.mascot[data-motion="twirl"] .mascot-float {
  transform: translateY(-7%);
  animation: mascot-hover 3s ease-in-out infinite;
}

.mascot[data-motion="twirl"] .mascot-shadow {
  animation: mascot-hover-shadow 3s ease-in-out infinite;
}

.mascot[data-motion="twirl"] .mascot-move {
  animation: mascot-twirl 6s ease-in-out infinite;
}

.mascot[data-motion="twirl"] .mascot-turn {
  animation: mascot-twirl-turn 6s ease-in-out infinite;
}

.mascot[data-motion="twirl"] .mascot-glance {
  animation: mascot-twirl-eyes 6s linear infinite;
}

.mascot[data-motion="twirl"] .mascot-blink {
  animation: mascot-twirl-blink 6s linear infinite;
}

.mascot[data-motion="twirl"] .mascot-shadow::before {
  animation: mascot-twirl-shadow 6s ease-in-out infinite;
}

.mascot[data-motion="twirl"] .mascot-extra {
  animation: mascot-sparkle 3s ease-in-out infinite;
}

@keyframes mascot-breathe {
  0%,
  100% {
    transform: scale(1, 1);
  }

  50% {
    transform: scale(0.985, 1.025);
  }
}

/* Crouches, springs up with a twist, lands with a squash and a little rebound (0–1.2s);
   leans left, then right, with an overshoot (1.6–3.8s); squints in a blink (4.1s);
   wiggles like jelly (4.6–5.3s). */
@keyframes mascot-play {
  0%,
  20.67%,
  26.67%,
  62.5%,
  68.33%,
  71.33%,
  76.67%,
  88%,
  100% {
    transform: translateY(0) rotate(0deg) scale(1, 1);
  }

  3.33% {
    transform: translateY(0) rotate(0deg) scale(1.12, 0.86);
    animation-timing-function: ease-out;
  }

  7% {
    transform: translateY(-20%) rotate(-6deg) scale(0.9, 1.12);
    animation-timing-function: ease-out;
  }

  9.17% {
    transform: translateY(-24%) rotate(-8deg) scale(1, 1);
    animation-timing-function: ease-in;
  }

  12.5% {
    transform: translateY(-4%) rotate(-2deg) scale(0.94, 1.08);
    animation-timing-function: ease-in;
  }

  13.67% {
    transform: translateY(0) rotate(0deg) scale(1.16, 0.84);
    animation-timing-function: ease-out;
  }

  16.33% {
    transform: translateY(-3%) rotate(2deg) scale(0.95, 1.06);
  }

  18.67% {
    transform: translateY(0) rotate(0deg) scale(1.04, 0.97);
  }

  30.83% {
    transform: translateY(0) rotate(-10deg) scale(1, 1);
  }

  32.83%,
  40% {
    transform: translateY(0) rotate(-8deg) scale(1, 1);
  }

  44.17% {
    transform: translateY(0) rotate(10deg) scale(1, 1);
  }

  46.17%,
  55% {
    transform: translateY(0) rotate(8deg) scale(1, 1);
  }

  58.33% {
    transform: translateY(0) rotate(-2deg) scale(1, 1);
  }

  60.33% {
    transform: translateY(0) rotate(1deg) scale(1, 1);
  }

  69.67% {
    transform: translateY(0) rotate(0deg) scale(1.03, 0.97);
  }

  78.67% {
    transform: translateY(0) rotate(0deg) scale(1.1, 0.9);
  }

  81% {
    transform: translateY(0) rotate(0deg) scale(0.93, 1.07);
  }

  83.33% {
    transform: translateY(0) rotate(0deg) scale(1.05, 0.95);
  }

  85.67% {
    transform: translateY(0) rotate(0deg) scale(0.98, 1.02);
  }
}

/* The eyes lead the lean. */
@keyframes mascot-play-eyes {
  0%,
  26.67%,
  58.33%,
  100% {
    transform: translateX(0) scaleX(1);
  }

  30.83%,
  40% {
    transform: translateX(calc(var(--look) * -1)) scaleX(0.9);
  }

  44.17%,
  55% {
    transform: translateX(var(--look)) scaleX(0.9);
  }
}

/* One blink while looking left (2.1s), two quick ones at 4.1s; about 130ms each. */
@keyframes mascot-play-blink {
  0%,
  34.2%,
  36.4%,
  68.3%,
  70.6%,
  72.9%,
  100% {
    transform: scaleY(1);
  }

  35.3%,
  69.4%,
  71.7% {
    transform: scaleY(0.1);
  }
}

@keyframes mascot-play-shadow {
  0%,
  20.67%,
  100% {
    transform: scale(1);
    opacity: 1;
  }

  3.33% {
    transform: scale(1.08);
  }

  7% {
    transform: scale(0.75);
    opacity: 0.7;
  }

  9.17% {
    transform: scale(0.65);
    opacity: 0.55;
  }

  12.5% {
    transform: scale(0.9);
    opacity: 0.9;
  }

  13.67% {
    transform: scale(1.1);
    opacity: 1;
  }

  16.33% {
    transform: scale(0.96);
  }

  18.67% {
    transform: scale(1.02);
  }
}

/* Airene never touches the ground: she bobs 7–12% above her shadow. */
@keyframes mascot-hover {
  0%,
  100% {
    transform: translateY(-7%);
  }

  50% {
    transform: translateY(-12%);
  }
}

@keyframes mascot-hover-shadow {
  0%,
  100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }

  50% {
    transform: translate(-50%, -50%) scale(0.85);
    opacity: 0.75;
  }
}

/* Crouches, pops up and twirls round at the top (0.15–1.5s), then a little dance, tilting
   left and right with two small bobs (3–3.8s). */
@keyframes mascot-twirl {
  0%,
  25%,
  50%,
  63.33%,
  100% {
    transform: translateY(0) rotate(0deg) scale(1, 1);
  }

  2.5% {
    transform: translateY(0) rotate(0deg) scale(1.1, 0.88);
    animation-timing-function: ease-out;
  }

  5.83% {
    transform: translateY(-14%) rotate(0deg) scale(0.92, 1.1);
    animation-timing-function: ease-out;
  }

  10.83% {
    transform: translateY(-22%) rotate(0deg) scale(1, 1);
    animation-timing-function: ease-in;
  }

  15.83% {
    transform: translateY(-3%) rotate(0deg) scale(0.95, 1.06);
    animation-timing-function: ease-in;
  }

  17.5% {
    transform: translateY(0) rotate(0deg) scale(1.12, 0.88);
    animation-timing-function: ease-out;
  }

  20% {
    transform: translateY(-4%) rotate(0deg) scale(0.96, 1.05);
  }

  22.5% {
    transform: translateY(0) rotate(0deg) scale(1.03, 0.98);
  }

  53.33% {
    transform: translateY(-5%) rotate(-10deg) scale(1, 1);
  }

  55.83% {
    transform: translateY(0) rotate(0deg) scale(1.06, 0.94);
  }

  58.33% {
    transform: translateY(-5%) rotate(10deg) scale(1, 1);
  }

  60.83% {
    transform: translateY(0) rotate(0deg) scale(1.06, 0.94);
  }
}

/* Seen side-on, a quarter of the way round, the body is narrower. */
@keyframes mascot-twirl-turn {
  0%,
  5%,
  11.25%,
  17.5%,
  100% {
    transform: scaleX(1);
  }

  8.13%,
  14.38% {
    transform: scaleX(0.6);
  }
}

/* A full turn in 0.75s, as if the eyes ride round a ball: they slide to one edge, squeezing
   as they go, hide while her back is to you, and come round the other side. They glance
   with the dance, too. */
@keyframes mascot-twirl-eyes {
  0%,
  5% {
    transform: translateX(0) scaleX(1);
    opacity: 1;
  }

  6.04% {
    transform: translateX(11%) scaleX(0.87);
  }

  7.08% {
    transform: translateX(19%) scaleX(0.5);
  }

  7.78% {
    transform: translateX(21.7%) scaleX(0.17);
    opacity: 1;
  }

  8.13% {
    transform: translateX(22%) scaleX(0.02);
    opacity: 0;
  }

  14.38% {
    transform: translateX(-22%) scaleX(0.02);
    opacity: 0;
  }

  14.72% {
    transform: translateX(-21.7%) scaleX(0.17);
    opacity: 1;
  }

  15.42% {
    transform: translateX(-19%) scaleX(0.5);
  }

  16.46% {
    transform: translateX(-11%) scaleX(0.87);
  }

  17.5%,
  50%,
  62.5%,
  100% {
    transform: translateX(0) scaleX(1);
    opacity: 1;
    animation-timing-function: ease-in-out;
  }

  53.33% {
    transform: translateX(calc(var(--look) * -1)) scaleX(0.9);
    animation-timing-function: ease-in-out;
  }

  58.33% {
    transform: translateX(var(--look)) scaleX(0.9);
    animation-timing-function: ease-in-out;
  }
}

/* One blink at 2.3s, two quick ones at 4.6s. */
@keyframes mascot-twirl-blink {
  0%,
  37.2%,
  39.4%,
  76.7%,
  79%,
  81.3%,
  100% {
    transform: scaleY(1);
  }

  38.3%,
  77.8%,
  80.1% {
    transform: scaleY(0.1);
  }
}

@keyframes mascot-twirl-shadow {
  0%,
  25%,
  50%,
  63.33%,
  100% {
    transform: scale(1);
    opacity: 1;
  }

  5.83% {
    transform: scale(0.8);
    opacity: 0.8;
  }

  10.83% {
    transform: scale(0.65);
    opacity: 0.6;
  }

  15.83% {
    transform: scale(0.95);
    opacity: 0.95;
  }

  17.5% {
    transform: scale(1.05);
    opacity: 1;
  }

  53.33%,
  58.33% {
    transform: scale(0.9);
    opacity: 0.9;
  }
}

/* Swells and turns a little, then settles: twice per loop. */
@keyframes mascot-sparkle {
  0%,
  30%,
  100% {
    transform: scale(1) rotate(0deg);
  }

  10% {
    transform: scale(1.3) rotate(30deg);
  }

  20% {
    transform: scale(0.85) rotate(-10deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .mascot-float,
  .mascot-move,
  .mascot-turn,
  .mascot-glance,
  .mascot-blink,
  .mascot-extra,
  .mascot-shadow,
  .mascot-shadow::before {
    animation: none !important;
  }
}
</style>
