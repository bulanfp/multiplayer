<template>
  <MpPopover
    id="project-info"
    v-slot="{ onClosePopover }"
    placement="bottom-start"
    use-portal
    :is-keep-alive="false"
  >
    <MpPopoverTrigger>
      <button type="button" :class="triggerClass" :aria-label="`${workspace.name}, project info`">
        <MpText size="h3" :class="nameClass">{{ workspace.name }}</MpText>
        <MpIcon
          name="chevrons-down"
          size="sm"
          color="icon.default"
          :class="css({ flexShrink: '0' })"
        />
      </button>
    </MpPopoverTrigger>

    <MpPopoverContent :class="css({ w: '300px' })">
      <!-- ═════ Actions, with who's already in as quiet context ═════ -->
      <MpPopoverList :class="topListClass">
        <MpPopoverListItem @click="invitePeople(onClosePopover)">
          <MpFlex alignItems="center" gap="3" width="full">
            <MpIcon name="people" size="sm" />
            <MpText :class="labelClass">Invite people</MpText>
            <span
              :class="stackClass"
              role="img"
              :aria-label="`${workspace.members.length} people in this project`"
            >
              <MemberAvatar
                v-for="member in workspace.members.slice(0, STACK_SIZE)"
                :key="member.personId"
                :actor="{ kind: 'person', id: member.personId }"
                size="xs"
                :class="faceClass"
              />
              <span v-if="workspace.members.length > STACK_SIZE" :class="moreClass">
                +{{ workspace.members.length - STACK_SIZE }}
              </span>
            </span>
          </MpFlex>
        </MpPopoverListItem>
        <MpPopoverListItem @click="openAgents(onClosePopover)">
          <MpFlex alignItems="center" gap="3" width="full">
            <MpIcon name="ai-assist" size="sm" />
            <MpText :class="labelClass">Agents</MpText>
            <span
              :class="stackClass"
              role="img"
              :aria-label="`${workspace.agentIds.length} agents in this project`"
            >
              <MemberAvatar
                v-for="agentId in workspace.agentIds.slice(0, STACK_SIZE)"
                :key="agentId"
                :actor="{ kind: 'agent', id: agentId }"
                size="xs"
                :class="agentIconClass"
              />
              <span v-if="workspace.agentIds.length > STACK_SIZE" :class="moreClass">
                +{{ workspace.agentIds.length - STACK_SIZE }}
              </span>
            </span>
          </MpFlex>
        </MpPopoverListItem>
      </MpPopoverList>

      <MpDivider />
      <MpPopoverList :class="listClass">
        <MpPopoverListItem @click="openSettings(onClosePopover)">
          <MpFlex alignItems="center" gap="3">
            <MpIcon name="settings" size="sm" />
            <MpText>Project settings</MpText>
          </MpFlex>
        </MpPopoverListItem>
      </MpPopoverList>
    </MpPopoverContent>
  </MpPopover>
</template>

<script setup lang="ts">
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
import MemberAvatar from "~/components/shared/MemberAvatar.vue";
import { useAppModals } from "~/composables/useAppModals";
import type { Workspace } from "~/data/types";
import { workspacePath } from "~/utils/paths";

interface ProjectInfoMenuProps {
  workspace: Workspace;
}

const props = defineProps<ProjectInfoMenuProps>();

const { open } = useAppModals();

function invitePeople(close: () => void) {
  close();
  open("invite");
}

function openAgents(close: () => void) {
  close();
  navigateTo(`${workspacePath(props.workspace.id)}/agents`);
}

function openSettings(close: () => void) {
  close();
  navigateTo(`${workspacePath(props.workspace.id)}/settings`);
}

const triggerClass = css({
  display: "flex",
  alignItems: "center",
  gap: "1",
  flex: "1",
  minW: "0",
  maxW: "full",
  px: "2",
  py: "1.5",
  rounded: "md",
  cursor: "pointer",
  textAlign: "left",
  _hover: { bg: "background.neutral.subtle.hovered" },
  _focusVisible: { outline: "2px solid", outlineColor: "border.focused" }
});

// Character-level ellipsis keeps more of a long project name visible than line clamping.
const nameClass = css({
  minW: "0",
  overflow: "hidden",
  whiteSpace: "nowrap",
  textOverflow: "ellipsis"
});

/** Faces or agent icons shown before the "+N" chip. */
const STACK_SIZE = 3;

// Pixel's list pads 12px above and 8px below; 4px keeps the menu compact, with a little
// more under the last item so it doesn't end abruptly.
const topListClass = css({ py: "1" });
const listClass = css({ pt: "1", pb: "2" });

const labelClass = css({ flex: "1", minW: "0" });

const stackClass = css({ display: "inline-flex", alignItems: "center", flexShrink: "0" });

// Overlapping faces with a ring so they stay distinct.
const faceClass = css({
  boxShadow: "0 0 0 2px token(colors.background.neutral)",
  "&:not(:first-child)": { ml: "-1.5" }
});

// Agent icons have their own padding, so they only tuck in slightly.
const agentIconClass = css({ "&:not(:first-child)": { ml: "-1" } });

// "+3" sits in the stack like one more avatar.
const moreClass = css({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minW: "20px",
  h: "20px",
  px: "1",
  ml: "-1",
  rounded: "full",
  bg: "background.neutral.subtle.hovered",
  boxShadow: "0 0 0 2px token(colors.background.neutral)",
  color: "text.secondary",
  fontSize: "xs",
  fontWeight: "semiBold",
  lineHeight: "1"
});
</script>
