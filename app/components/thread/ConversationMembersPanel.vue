<template>
  <!-- 300px wide plus its 8px left margin, so the slide starts fully off to the right -->
  <aside :class="panelClass" aria-label="Members" style="--panel-offset: 308px">
    <header :class="headerClass">
      <MpText size="h3">Members</MpText>
      <MpButton
        variant="ghost"
        size="sm"
        left-icon="close"
        aria-label="Close members"
        @click="emit('close')"
      />
    </header>

    <div :class="bodyClass">
      <MpButton variant="secondary" left-icon="add" is-full-width @click="emit('add')">
        {{ conversation.kind === "channel" ? "Add people or agents" : "Add an agent" }}
      </MpButton>

      <section>
        <MpText size="label-small" weight="semiBold" color="text.secondary" :class="labelClass">
          People ({{ conversation.memberIds.length }})
        </MpText>
        <ul>
          <li v-for="personId in conversation.memberIds" :key="personId" :class="rowClass">
            <MemberAvatar :actor="{ kind: 'person', id: personId }" />
            <MpFlex direction="column" minWidth="0">
              <MpText weight="semiBold" is-truncated>
                {{ getPerson(personId)?.name }}{{ personId === CURRENT_USER_ID ? " (you)" : "" }}
              </MpText>
              <MpText size="label-small" color="text.secondary" is-truncated>
                {{ getPerson(personId)?.title }}
              </MpText>
            </MpFlex>
          </li>
        </ul>
      </section>

      <section>
        <MpText size="label-small" weight="semiBold" color="text.secondary" :class="labelClass">
          Agents ({{ conversation.agentIds.length }})
        </MpText>
        <ul v-if="conversation.agentIds.length">
          <li v-for="agentId in conversation.agentIds" :key="agentId" :class="rowClass">
            <MemberAvatar :actor="{ kind: 'agent', id: agentId }" />
            <MpFlex direction="column" minWidth="0">
              <MpText weight="semiBold" is-truncated>{{ getAgent(agentId)?.name }}</MpText>
              <MpText size="label-small" color="text.secondary" is-truncated>
                {{ getAgent(agentId)?.role }}
              </MpText>
            </MpFlex>
          </li>
        </ul>
        <MpText v-else size="body-small" color="text.secondary" :class="css({ py: '2' })">
          No agents yet. Add one so people can @mention it here.
        </MpText>
      </section>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { css, MpButton, MpFlex, MpText } from "@mekari/pixel3";
import MemberAvatar from "~/components/shared/MemberAvatar.vue";
import { getAgent } from "~/data/agents";
import { CURRENT_USER_ID, getPerson } from "~/data/people";
import type { Conversation } from "~/data/types";

defineProps<{ conversation: Conversation }>();
const emit = defineEmits<{ close: []; add: [] }>();

// Same floating card as the output canvas.
const panelClass = css({
  display: "flex",
  flexDirection: "column",
  flexShrink: "0",
  w: "300px",
  m: "2",
  bg: "background.neutral",
  borderWidth: "1px",
  borderColor: "border.default",
  rounded: "xl",
  boxShadow: "0 1px 3px 0 token(colors.neutral.200a)",
  overflow: "hidden"
});

const headerClass = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  px: "5",
  py: "4",
  borderBottomWidth: "1px",
  borderColor: "border.default"
});

const bodyClass = css({
  display: "flex",
  flexDirection: "column",
  gap: "5",
  flex: "1",
  minH: "0",
  overflowY: "auto",
  px: "5",
  py: "4"
});

const labelClass = css({ textTransform: "uppercase", letterSpacing: "0.1em", mb: "1" });

const rowClass = css({ display: "flex", alignItems: "center", gap: "3", py: "2" });
</script>
