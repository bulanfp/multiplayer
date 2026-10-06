<template>
  <DropdownTransition align="right" min-width="280px">
    <template #trigger>
      <button type="button" :class="triggerClass" aria-haspopup="menu">
        <MpAvatar
          :name="name"
          :src="avatar"
          size="lg"
          variant-color="gray"
          :class="!avatar && avatarClass"
        />
        <MpFlex direction="column" alignItems="flex-start">
          <MpText weight="semiBold" color="text.inverse">{{ name }}</MpText>
          <MpText size="body-small" color="text.inverse" :class="css({ opacity: '0.7' })">
            {{ company }}
          </MpText>
        </MpFlex>
      </button>
    </template>

    <div role="menu" :class="css({ display: 'flex', flexDirection: 'column', pt: '2' })">
      <button
        v-for="item in MENU_ITEMS"
        :key="item.label"
        type="button"
        role="menuitem"
        :class="menuItemClass"
      >
        <MpIcon :name="item.icon" size="sm" color="icon.brand" />
        <span>{{ item.label }}</span>
      </button>

      <MpDivider />

      <button type="button" role="menuitem" :class="[menuItemClass, spaceBetweenClass]">
        <span>Language</span>
        <span :class="css({ color: 'text.secondary' })">English</span>
      </button>
      <button type="button" role="menuitem" :class="menuItemClass">
        <span>Sign out</span>
      </button>

      <MpText color="text.secondary" :class="css({ px: '3', pt: '1', pb: '3' })">
        Company ID: {{ companyId }}
      </MpText>
    </div>
  </DropdownTransition>
</template>

<script setup lang="ts">
import { css, MpAvatar, MpDivider, MpFlex, MpIcon, MpText, type IconName } from "@mekari/pixel3";
import DropdownTransition from "~/components/layout/DropdownTransition.vue";

interface UserProfileProps {
  /** Display name, also used for the avatar initials */
  name: string;
  /** Profile photo; initials show without one */
  avatar?: string;
  /** Company shown under the name */
  company: string;
  /** Company ID shown at the bottom of the menu */
  companyId: string;
}

defineProps<UserProfileProps>();

const MENU_ITEMS: { label: string; icon: IconName }[] = [
  { label: "My info", icon: "employee" },
  { label: "Company info", icon: "company" },
  { label: "Release notes", icon: "join-invoice" },
  { label: "Contact support", icon: "call-active" }
];

const triggerClass = css({
  display: "flex",
  alignItems: "center",
  gap: "3",
  px: "2",
  py: "1",
  rounded: "lg",
  cursor: "pointer",
  textAlign: "left",
  _groupHover: { bg: "background.header.menu.hovered" },
  _focusVisible: {
    outline: "2px solid",
    outlineColor: "background.header.menu.selected",
    outlineOffset: "2px"
  }
});

// Initials fallback: design uses mint, which Pixel has no variant color for.
const avatarClass = css({
  bg: "background.brand.hovered !important",
  color: "text.default !important"
});

const menuItemClass = css({
  display: "flex",
  alignItems: "center",
  gap: "3",
  w: "full",
  px: "3",
  py: "2",
  fontSize: "md",
  textAlign: "left",
  color: "text.default",
  cursor: "pointer",
  _hover: { bg: "background.neutral.hovered" },
  _focusVisible: { outline: "none", bg: "background.neutral.hovered" }
});

const spaceBetweenClass = css({ justifyContent: "space-between" });
</script>
