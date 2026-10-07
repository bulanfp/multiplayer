<template>
  <!-- The chevron and the actions show while the pointer is over the section (its header or
       its rows) or keyboard focus is in it. Only :focus-visible counts, so a clicked toggle
       doesn't keep them showing. -->
  <section :aria-labelledby="`${id}-label`" :class="sectionClass">
    <div :class="headerClass">
      <h2 :class="headingClass">
        <button
          :id="`${id}-label`"
          type="button"
          :class="toggleClass"
          :aria-expanded="isOpen(id)"
          :aria-controls="`${id}-list`"
          @click="toggle(id)"
        >
          <SectionLabel as="span">{{ label }}</SectionLabel>
          <span :class="revealClass" data-reveal>
            <MpIcon
              name="chevrons-down"
              size="sm"
              color="icon.default"
              :class="caretClass"
              :data-collapsed="!isOpen(id) || undefined"
            />
          </span>
        </button>
      </h2>
      <div :class="[actionsClass, revealClass]" data-reveal>
        <slot name="actions" />
      </div>
    </div>
    <div :id="`${id}-list`">
      <slot :is-open="isOpen(id)" />
    </div>
  </section>
</template>

<script setup lang="ts">
import { css, MpIcon } from "@mekari/pixel3";
import SectionLabel from "~/components/layout/SectionLabel.vue";
import { useSidebarSections } from "~/composables/useSidebarSections";

interface SidebarSectionProps {
  /** Unique key; also remembers whether the section is collapsed */
  id: string;
  label: string;
}

defineProps<SidebarSectionProps>();

const { isOpen, toggle } = useSidebarSections();

const sectionClass = css({
  "&:hover [data-reveal], &:has(:focus-visible) [data-reveal]": { opacity: "1" }
});

// The whole row highlights on hover; the label part toggles, the icons on the right act.
const headerClass = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "1",
  pr: "1",
  rounded: "md",
  transition: "background-color .15s ease",
  _hover: { bg: "background.neutral.subtle.hovered" }
});

const headingClass = css({ flex: "1", minW: "0" });

// 8px in, like the rows below, so the label starts where their icons, emoji and avatars do
// (and Airene's above). The chevron follows the label.
const toggleClass = css({
  display: "flex",
  alignItems: "center",
  gap: "1",
  w: "full",
  h: "8",
  px: "2",
  rounded: "md",
  cursor: "pointer",
  "& > h2, & > span": { px: "0" },
  _focusVisible: { outline: "2px solid", outlineColor: "border.focused" }
});

const revealClass = css({
  display: "flex",
  opacity: "0",
  transition: "opacity .15s ease",
  _motionReduce: { transition: "none" }
});

const caretClass = css({
  transition: "transform .15s",
  "&[data-collapsed]": { transform: "rotate(-90deg)" },
  _motionReduce: { transition: "none" }
});

const actionsClass = css({ alignItems: "center", gap: "0.5" });
</script>
