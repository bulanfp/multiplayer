<!--
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Mekari Multiplayer — Agents
  Source: screenshots of the Mekari ERP Cowork agents list (mekari-erp.vercel.app/cowork-agents)
  Token mode: Pixel 2.4, enterprise product theme
  Patterns used: layout-shell, filter
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  STATES INCLUDED:
    - Grid of agents: icon, what it does, when it was last used, and a Message button that
      starts a new chat with it
    - Filter: all / in your chats / not yet; search by name or description
    - Create agent is a placeholder: the flow is being redesigned, so the button does nothing yet
    - Nothing matches the filters: a short line instead of the grid
-->
<template>
  <div v-if="workspace" :class="pageClass">
    <PageHeader title="Agents">
      <template #actions>
        <!-- Placeholder until the Create agent flow is redesigned -->
        <MpButton is-rounded left-icon="add">Create agent</MpButton>
      </template>
    </PageHeader>

    <PageContent>
      <!-- ═════ Filters ═════ -->
      <div :class="toolbarClass">
        <SelectPopover
          id="agent-scope-filter"
          v-model="scope"
          label="Which agents"
          :options="SCOPE_OPTIONS"
          :class="selectClass"
        />
        <div :class="searchClass">
          <SearchInput id="agent-search" v-model="query" placeholder="Search agents" />
        </div>
      </div>

      <!-- ═════ Agents ═════ -->
      <div v-if="agents.length" :class="gridWrapClass">
        <ul :class="gridClass">
          <li v-for="agent in agents" :key="agent.id">
            <AgentCard
              :agent="agent"
              :to="agentPath(workspace.id, agent.id)"
              :last-active-at="lastActive.get(agent.id)"
              @message="navigateTo(newAgentChatRoute(workspace.id, agent.id))"
            />
          </li>
        </ul>
      </div>
      <MpText v-else color="text.secondary" :class="css({ py: '4' })">
        No agents match these filters.
      </MpText>
    </PageContent>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { css, MpButton, MpText } from "@mekari/pixel3";
import SearchInput from "~/components/chat/SearchInput.vue";
import PageContent from "~/components/layout/PageContent.vue";
import PageHeader from "~/components/layout/PageHeader.vue";
import AgentCard from "~/components/pages/AgentCard.vue";
import SelectPopover from "~/components/shared/SelectPopover.vue";
import { useChatStore } from "~/composables/useChatStore";
import { useCurrentWorkspace } from "~/composables/useCurrentWorkspace";
import { useWorkspaceStore } from "~/composables/useWorkspaceStore";
import { AGENTS } from "~/data/agents";
import { agentPath, newAgentChatRoute } from "~/utils/paths";

const { workspace } = useCurrentWorkspace();
const { state, chatsWith } = useWorkspaceStore();
const { messagesFor } = useChatStore();

type Scope = "all" | "chatting" | "new";

const SCOPE_OPTIONS: { value: Scope; label: string }[] = [
  { value: "all", label: "All agents" },
  { value: "chatting", label: "In your chats" },
  { value: "new", label: "Not chatted yet" }
];

const scope = ref<Scope>("all");
const query = ref("");

// The agents you already chat with first, then the rest.
const agents = computed(() => {
  const hasChat = (id: string) =>
    Boolean(workspace.value && chatsWith(workspace.value.id, id).length);
  const needle = query.value.trim().toLowerCase();
  return AGENTS.filter((agent) => {
    if (scope.value === "chatting" && !hasChat(agent.id)) return false;
    if (scope.value === "new" && hasChat(agent.id)) return false;
    return (
      !needle ||
      agent.name.toLowerCase().includes(needle) ||
      agent.description.toLowerCase().includes(needle)
    );
  }).sort((a, b) => Number(hasChat(b.id)) - Number(hasChat(a.id)));
});

/** Each agent's latest message anywhere: your chats with it and the groups it's in. */
const lastActive = computed(() => {
  const latest = new Map<string, string>();
  state.conversations
    .filter((conversation) => conversation.workspaceId === workspace.value?.id)
    .forEach((conversation) =>
      messagesFor(conversation.id).forEach((message) => {
        if (message.sender.kind !== "agent") return;
        const current = latest.get(message.sender.id);
        if (!current || message.createdAt > current) {
          latest.set(message.sender.id, message.createdAt);
        }
      })
    );
  return latest;
});

useHead({ title: "Agents" });

const pageClass = css({ display: "flex", flexDirection: "column", flex: "1", minH: "0" });

const toolbarClass = css({
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: "3",
  mb: "6"
});

const selectClass = css({ w: "200px" });

const searchClass = css({ w: "280px", ml: "auto" });

// Lines only between cells: each card draws its right and bottom edge, and the outer
// ones are clipped off.
const gridWrapClass = css({ overflow: "hidden" });

const gridClass = css({
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
  mr: "-1px",
  mb: "-1px"
});
</script>
