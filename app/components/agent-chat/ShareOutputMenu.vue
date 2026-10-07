<template>
  <!-- Private until shared: opens a group with the output quoted in its message box, so you
       can say what it's for before you send it -->
  <div :class="css({ mt: '2' })">
    <MpPopover
      :id="`share-${outputId}-${version}`"
      v-slot="{ onClosePopover }"
      placement="bottom-start"
      use-portal
      :is-keep-alive="false"
    >
      <MpPopoverTrigger>
        <MpButton is-rounded variant="secondary" size="sm" left-icon="share">Share</MpButton>
      </MpPopoverTrigger>
      <MpPopoverContent :class="css({ minW: '240px', maxH: '320px', overflowY: 'auto' })">
        <div :class="headingClass"><SectionLabel as="span">Share to a group</SectionLabel></div>
        <MpPopoverList v-if="groups.length" :class="listClass">
          <MpPopoverListItem
            v-for="group in groups"
            :key="group.id"
            @click="shareTo(group, onClosePopover)"
          >
            {{ conversationLabel(group) }}
          </MpPopoverListItem>
        </MpPopoverList>
        <MpText v-else size="body-small" color="text.secondary" :class="emptyClass">
          Join a group first, then share it there.
        </MpText>
      </MpPopoverContent>
    </MpPopover>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import {
  css,
  MpButton,
  MpPopover,
  MpPopoverContent,
  MpPopoverList,
  MpPopoverListItem,
  MpPopoverTrigger,
  MpText
} from "@mekari/pixel3";
import SectionLabel from "~/components/layout/SectionLabel.vue";
import { useChatStore } from "~/composables/useChatStore";
import { useWorkspaceStore } from "~/composables/useWorkspaceStore";
import type { Conversation } from "~/data/types";
import { conversationPath } from "~/utils/paths";

interface ShareOutputMenuProps {
  workspaceId: string;
  outputId: string;
  /** The version this message produced */
  version: number;
}

const props = defineProps<ShareOutputMenuProps>();

const { joinedChannelsIn, conversationLabel } = useWorkspaceStore();
const { startShare } = useChatStore();

const groups = computed(() => joinedChannelsIn(props.workspaceId));

function shareTo(conversation: Conversation, close: () => void) {
  startShare(conversation.id, props.outputId, props.version);
  close();
  navigateTo(conversationPath(props.workspaceId, conversation.slug));
}

// With the label's own 8px, its text lines up with the items' 12px inset.
const headingClass = css({ px: "1", pt: "3", pb: "1" });

// Pixel's list pads 12px above and 8px below; the heading above takes the top.
const listClass = css({ pt: "0", pb: "1" });

const emptyClass = css({ px: "3", pb: "3" });
</script>
