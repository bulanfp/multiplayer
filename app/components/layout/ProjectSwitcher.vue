<template>
  <MpPopover
    id="project-switcher"
    v-slot="{ isOpen, onClosePopover }"
    placement="right-start"
    use-portal
    :is-keep-alive="false"
    @close="onMenuClose"
  >
    <MpPopoverTrigger>
      <button
        type="button"
        :class="triggerClass"
        :aria-label="`Switch project. Current project: ${current?.name ?? 'none'}`"
        @mouseenter="hoverIn(isOpen)"
        @mouseleave="hoverOut(isOpen)"
        @click="pinIfHovered($event, isOpen)"
      >
        <ProjectAvatar v-if="current" :workspace="current" />
      </button>
    </MpPopoverTrigger>

    <MpPopoverContent
      :class="css({ w: '300px' })"
      @mouseenter="hoverIn(isOpen)"
      @mouseleave="hoverOut(isOpen)"
    >
      <MpPopoverList :class="listClass">
        <MpPopoverListItem
          v-for="workspace in myWorkspaces()"
          :key="workspace.id"
          :is-active="workspace.id === current?.id"
          @click="switchTo(workspace.id, onClosePopover)"
        >
          <MpFlex alignItems="center" gap="3" width="full">
            <ProjectAvatar :workspace="workspace" size="sm" />
            <MpText weight="semiBold" is-truncated :class="css({ flex: '1', minW: '0' })">
              {{ workspace.name }}
            </MpText>
            <MpIcon v-if="workspace.id === current?.id" name="check" size="sm" color="icon.brand" />
          </MpFlex>
        </MpPopoverListItem>
      </MpPopoverList>
      <MpDivider />
      <MpPopoverList :class="lastListClass">
        <MpPopoverListItem @click="createProject(onClosePopover)">
          <MpFlex alignItems="center" gap="3">
            <MpIcon name="add" size="sm" />
            <MpText>Create project</MpText>
          </MpFlex>
        </MpPopoverListItem>
      </MpPopoverList>
    </MpPopoverContent>
  </MpPopover>
</template>

<script setup lang="ts">
import type { Ref } from "vue";
import {
  css,
  MpDivider,
  MpFlex,
  MpIcon,
  MpPopover,
  MpPopoverContent,
  MpPopoverList,
  MpPopoverListItem,
  MpPopoverTrigger,
  MpText
} from "@mekari/pixel3";
import ProjectAvatar from "~/components/layout/ProjectAvatar.vue";
import { useAppModals } from "~/composables/useAppModals";
import { useCurrentWorkspace } from "~/composables/useCurrentWorkspace";
import { useWorkspaceStore } from "~/composables/useWorkspaceStore";

const { workspace: current } = useCurrentWorkspace();
const { myWorkspaces, homePath } = useWorkspaceStore();
const { open } = useAppModals();

// Hover opens the switcher (after a short pause, so sweeping past doesn't), and it closes
// once the pointer has left both the icon and the menu. A click pins it open.
const HOVER_OPEN_DELAY = 150;
const HOVER_CLOSE_DELAY = 250;
let openTimer: ReturnType<typeof setTimeout> | undefined;
let closeTimer: ReturnType<typeof setTimeout> | undefined;
let openedByHover = false;

function hoverIn(isOpen: Ref<boolean>) {
  clearTimeout(closeTimer);
  if (isOpen.value) return;
  openTimer = setTimeout(() => {
    if (isOpen.value) return;
    isOpen.value = true;
    openedByHover = true;
  }, HOVER_OPEN_DELAY);
}

function hoverOut(isOpen: Ref<boolean>) {
  clearTimeout(openTimer);
  if (!openedByHover) return;
  closeTimer = setTimeout(() => {
    isOpen.value = false;
    openedByHover = false;
  }, HOVER_CLOSE_DELAY);
}

/**
 * A click is a deliberate open: it cancels a pending hover-open, and clicking a menu that
 * hover opened keeps it open instead of toggling it shut.
 */
function pinIfHovered(event: MouseEvent, isOpen: Ref<boolean>) {
  clearTimeout(openTimer);
  if (!openedByHover || !isOpen.value) return;
  // Pixel merges its own toggle onto this button; stop it from closing the menu.
  event.stopImmediatePropagation();
  clearTimeout(closeTimer);
  openedByHover = false;
}

function onMenuClose() {
  clearTimeout(openTimer);
  clearTimeout(closeTimer);
  openedByHover = false;
}

function switchTo(workspaceId: string, close: () => void) {
  close();
  navigateTo(homePath(workspaceId));
}

function createProject(close: () => void) {
  close();
  open("create-project");
}

const triggerClass = css({
  display: "flex",
  rounded: "lg",
  cursor: "pointer",
  transition: "box-shadow .15s",
  _hover: { boxShadow: "0 0 0 2px token(colors.background.header.menu.hovered)" },
  _focusVisible: {
    outline: "2px solid",
    outlineColor: "border.inverse",
    outlineOffset: "2px"
  }
});

// Pixel's list pads 12px above and 8px below; 4px keeps the menu compact.
const listClass = css({ py: "1" });

// A little more room under the last item so the menu doesn't end abruptly.
const lastListClass = css({ pt: "1", pb: "2" });
</script>
