<template>
  <section :aria-labelledby="`${id}-label`">
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
          <MpIcon
            name="chevrons-down"
            size="sm"
            color="icon.default"
            :class="caretClass"
            :data-collapsed="!isOpen(id) || undefined"
          />
          <SectionLabel as="span">{{ label }}</SectionLabel>
        </button>
      </h2>
      <div :class="actionsClass">
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

const toggleClass = css({
  display: "flex",
  alignItems: "center",
  gap: "1",
  w: "full",
  h: "8",
  pl: "1",
  pr: "2",
  rounded: "md",
  cursor: "pointer",
  "& > h2, & > span": { px: "0" },
  _focusVisible: { outline: "2px solid", outlineColor: "border.focused" }
});

const caretClass = css({
  transition: "transform .15s",
  "&[data-collapsed]": { transform: "rotate(-90deg)" }
});

const actionsClass = css({ display: "flex", alignItems: "center", gap: "0.5" });
</script>
