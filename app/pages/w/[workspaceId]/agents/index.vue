<template>
  <div v-if="workspace" :class="pageClass">
    <PageHeader
      title="Agents"
      subtitle="Agents reply when someone @mentions them in a conversation."
    >
      <template #actions>
        <MpButton left-icon="add" @click="open('create-agent')">Create agent</MpButton>
      </template>
    </PageHeader>

    <PageContent>
      <MpText size="h3">In {{ workspace.name }} ({{ projectAgents.length }})</MpText>
      <ul :class="css({ mt: '2' })">
        <AgentCatalogRow v-for="agent in projectAgents" :key="agent.id" :agent="agent">
          <MpButton variant="secondary" @click="navigateTo(agentPath(workspace.id, agent.id))">
            Chat
          </MpButton>
        </AgentCatalogRow>
      </ul>

      <MpText size="h3" :class="css({ mt: '8' })"
        >Available to add ({{ otherAgents.length }})</MpText
      >
      <ul v-if="otherAgents.length" :class="css({ mt: '2' })">
        <AgentCatalogRow v-for="agent in otherAgents" :key="agent.id" :agent="agent">
          <MpButton variant="secondary" left-icon="add" @click="addAgent(agent.id, agent.name)">
            Add to project
          </MpButton>
        </AgentCatalogRow>
      </ul>
      <MpText v-else color="text.secondary" :class="css({ mt: '2' })">
        Every agent is already in this project.
      </MpText>
    </PageContent>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { css, toast, MpButton, MpText } from "@mekari/pixel3";
import PageContent from "~/components/layout/PageContent.vue";
import PageHeader from "~/components/layout/PageHeader.vue";
import AgentCatalogRow from "~/components/pages/AgentCatalogRow.vue";
import { useAppModals } from "~/composables/useAppModals";
import { useCurrentWorkspace } from "~/composables/useCurrentWorkspace";
import { useWorkspaceStore } from "~/composables/useWorkspaceStore";
import { AGENTS } from "~/data/agents";
import { agentPath } from "~/utils/paths";

const { workspace } = useCurrentWorkspace();
const { addAgentToWorkspace } = useWorkspaceStore();
const { open } = useAppModals();

const projectAgents = computed(() =>
  AGENTS.filter((agent) => workspace.value?.agentIds.includes(agent.id))
);
const otherAgents = computed(() =>
  AGENTS.filter((agent) => !workspace.value?.agentIds.includes(agent.id))
);

useHead({ title: "Agents" });

function addAgent(agentId: string, name: string) {
  if (!workspace.value) return;
  addAgentToWorkspace(workspace.value.id, agentId);
  toast.notify({ title: `Added ${name} to ${workspace.value.name}`, variant: "success" });
}

const pageClass = css({ display: "flex", flexDirection: "column", flex: "1", minH: "0" });
</script>
