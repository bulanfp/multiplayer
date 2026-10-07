<template>
  <figure :class="chartClass">
    <div :class="plotClass" role="img" :aria-label="summary">
      <div
        v-for="line in gridLines"
        :key="line.value"
        :class="gridLineClass"
        :style="{ bottom: `${(line.value / top) * 100}%` }"
      >
        <span :class="axisLabelClass">{{ line.label }}</span>
      </div>
      <div :class="barsClass">
        <div
          v-for="day in days"
          :key="day.date"
          :class="barSlotClass"
          :title="`${DAY.format(new Date(day.date))}: ${formatRupiah(day.cost)}`"
        >
          <div :class="barClass" :style="{ height: `${(day.cost / top) * 100}%` }" />
        </div>
      </div>
    </div>

    <!-- One date a week, counting back from today -->
    <div :class="ticksClass" aria-hidden="true">
      <span v-for="(day, index) in days" :key="day.date" :class="tickClass">
        {{ (days.length - 1 - index) % 7 === 0 ? DAY.format(new Date(day.date)) : "" }}
      </span>
    </div>
  </figure>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { css } from "@mekari/pixel3";
import type { UsageDay } from "~/utils/agent-usage";
import { formatRupiah } from "~/utils/format";

interface AgentUsageChartProps {
  days: UsageDay[];
}

const props = defineProps<AgentUsageChartProps>();

const DAY = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" });

// Round steps (Rp50rb or Rp100rb) so the grid lines read as plain numbers.
const step = computed(() => {
  const max = Math.max(...props.days.map((day) => day.cost), 1);
  return max <= 150_000 ? 50_000 : 100_000;
});

const top = computed(() => {
  const max = Math.max(...props.days.map((day) => day.cost), 1);
  return Math.max(step.value, Math.ceil(max / step.value) * step.value);
});

const gridLines = computed(() =>
  Array.from({ length: top.value / step.value }, (_, index) => {
    const value = (index + 1) * step.value;
    return { value, label: `Rp${value / 1000}rb` };
  })
);

const summary = computed(() => {
  const busiest = props.days.reduce((best, day) => (day.cost > best.cost ? day : best));
  return `Daily cost over ${props.days.length} days. Busiest day: ${DAY.format(new Date(busiest.date))}, ${formatRupiah(busiest.cost)}.`;
});

const chartClass = css({ display: "flex", flexDirection: "column", gap: "2", m: "0" });

const plotClass = css({
  position: "relative",
  h: "240px",
  borderBottomWidth: "1px",
  borderColor: "border.default"
});

const gridLineClass = css({
  position: "absolute",
  left: "0",
  right: "0",
  borderTopWidth: "1px",
  borderColor: "border.default",
  borderStyle: "dashed"
});

const axisLabelClass = css({
  position: "absolute",
  right: "0",
  bottom: "1",
  fontSize: "xs",
  color: "text.secondary"
});

// Bars leave room on the right for the axis labels.
const barsClass = css({
  position: "absolute",
  top: "0",
  bottom: "0",
  left: "0",
  right: "64px",
  display: "flex",
  alignItems: "flex-end",
  gap: "1.5"
});

const barSlotClass = css({
  display: "flex",
  alignItems: "flex-end",
  flex: "1",
  h: "full",
  cursor: "default"
});

const barClass = css({
  w: "full",
  minH: "2px",
  roundedTop: "sm",
  bg: "background.brand.bold",
  transition: "background-color .15s ease",
  _hover: { bg: "background.brand.bold.hovered" }
});

const ticksClass = css({ display: "flex", gap: "1.5", mr: "64px" });

const tickClass = css({
  display: "flex",
  justifyContent: "center",
  flex: "1",
  fontSize: "xs",
  color: "text.secondary",
  whiteSpace: "nowrap"
});
</script>
