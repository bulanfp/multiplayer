<!--
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Mekari Multiplayer — Agent detail
  Source: screenshots of the Mekari ERP Cowork agent detail (mekari-erp.vercel.app/cowork-agents)
  Token mode: Pixel 2.4, enterprise product theme
  Patterns used: layout-shell, detail-view
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  STATES INCLUDED:
    - Who the agent is, then tabs: Overview, Knowledge, Skills, Connections, Visibility, Usage
    - Message starts a new chat with this agent; it's saved once you send
    - Custom agents: their own instructions; empty lines where there's nothing set up yet
    - Unknown agent: not found

  OPEN ITEMS for product/design follow-up:
    - Editing instructions, knowledge, skills and connections (read-only for now)
    - Real usage and cost; the chart is seeded mock data
-->
<template>
  <div :class="pageClass">
    <template v-if="workspace && agent">
      <!-- ═════ Page header ═════ -->
      <PageHeader :title="agent.name" :parent="{ label: 'Agents', to: agentsPath }">
        <template #actions>
          <MpButton is-rounded @click="navigateTo(newAgentChatRoute(workspace.id, agent.id))">
            Message
          </MpButton>
        </template>
      </PageHeader>

      <PageContent>
        <!-- ═════ Who it is ═════ -->
        <div :class="introClass">
          <img v-if="agent.icon" :src="agent.icon" alt="" :class="introIconClass" />
          <MemberAvatar v-else :actor="{ kind: 'agent', id: agent.id }" size="lg" />
          <div :class="introTextClass">
            <MpText as="h2" size="h2">{{ agent.name }}</MpText>
            <MpText size="label-small" color="text.secondary">{{ agent.role }}</MpText>
            <MpText :class="css({ mt: '2' })">{{ agent.description }}</MpText>
          </div>
        </div>

        <MpTabs id="agent-tabs" v-model="tab" is-manual>
          <MpTabList>
            <MpTab v-for="label in TABS" :key="label">{{ label }}</MpTab>
          </MpTabList>

          <MpTabPanels>
            <!-- ═════ Overview ═════ -->
            <MpTabPanel>
              <div :class="panelClass">
                <section :class="sectionClass">
                  <MpText as="h3" size="h3">Instruction</MpText>
                  <MpText v-if="profile.instruction" :class="css({ whiteSpace: 'pre-wrap' })">
                    {{ profile.instruction }}
                  </MpText>
                  <MpText v-else color="text.secondary">No instructions yet.</MpText>
                </section>
                <section :class="sectionClass">
                  <MpText as="h3" size="h3">Model</MpText>
                  <span :class="inlineClass">
                    <MpIcon name="ai-assist" size="sm" color="icon.brand" />
                    <MpText>{{ profile.model }}</MpText>
                  </span>
                </section>
                <section :class="sectionClass">
                  <MpText as="h3" size="h3">Language</MpText>
                  <MpText>Auto (matches the person asking)</MpText>
                </section>
                <section :class="sectionClass">
                  <MpText as="h3" size="h3">Made by</MpText>
                  <MpText>{{ maker }}</MpText>
                </section>
                <section :class="sectionClass">
                  <MpText as="h3" size="h3">Tasks this agent runs</MpText>
                  <ul v-if="profile.tasks.length" :class="rowsClass">
                    <li v-for="task in profile.tasks" :key="task.title" :class="rowClass">
                      <div :class="rowTextClass">
                        <MpText weight="semiBold">{{ task.title }}</MpText>
                        <MpText size="label-small" color="text.secondary">
                          {{ task.description }}
                        </MpText>
                      </div>
                    </li>
                  </ul>
                  <MpText v-else color="text.secondary">No tasks yet.</MpText>
                </section>
              </div>
            </MpTabPanel>

            <!-- ═════ Knowledge ═════ -->
            <MpTabPanel>
              <div :class="panelClass">
                <section :class="sectionClass">
                  <MpText as="h3" size="h3">Live data sources</MpText>
                  <ul v-if="profile.sources.length" :class="chipsClass">
                    <li v-for="source in profile.sources" :key="source" :class="chipClass">
                      <MpText size="label-small">{{ source }}</MpText>
                    </li>
                  </ul>
                  <MpText v-else color="text.secondary">No live data connected.</MpText>
                </section>
                <section :class="sectionClass">
                  <MpText as="h3" size="h3">
                    Knowledge base ({{ profile.knowledge.length }})
                  </MpText>
                  <ul v-if="profile.knowledge.length" :class="rowsClass">
                    <li v-for="name in profile.knowledge" :key="name" :class="rowClass">
                      <span :class="inlineClass">
                        <MpIcon name="doc" size="md" color="icon.default" />
                        <MpText>{{ name }}</MpText>
                      </span>
                    </li>
                  </ul>
                  <MpText v-else color="text.secondary">No documents attached.</MpText>
                </section>
              </div>
            </MpTabPanel>

            <!-- ═════ Skills ═════ -->
            <MpTabPanel>
              <div :class="panelClass">
                <section v-for="group in profile.skills" :key="group.group" :class="sectionClass">
                  <MpText as="h3" size="h3">{{ group.group }}</MpText>
                  <ul :class="rowsClass">
                    <li v-for="skill in group.items" :key="skill.name" :class="rowClass">
                      <div :class="rowTextClass">
                        <span :class="inlineClass">
                          <MpText weight="semiBold">{{ skill.name }}</MpText>
                          <MpBadge
                            for="tableStatus"
                            :type="SKILL_EFFECTS[skill.effect].badge"
                            size="sm"
                          >
                            {{ SKILL_EFFECTS[skill.effect].label }}
                          </MpBadge>
                        </span>
                        <MpText size="label-small" color="text.secondary">
                          {{ skill.description }}
                        </MpText>
                      </div>
                      <span :class="pillClass">
                        <MpText size="label-small">
                          {{ skill.approval === "ask" ? "Ask first" : "Allowed" }}
                        </MpText>
                      </span>
                    </li>
                  </ul>
                </section>
                <MpText v-if="!profile.skills.length" color="text.secondary">
                  No skills yet.
                </MpText>
              </div>
            </MpTabPanel>

            <!-- ═════ Connections ═════ -->
            <MpTabPanel>
              <div :class="panelClass">
                <section :class="sectionClass">
                  <MpText as="h3" size="h3">Connections</MpText>
                  <ul v-if="profile.connections.length" :class="rowsClass">
                    <li v-for="item in profile.connections" :key="item.name" :class="rowClass">
                      <span :class="inlineClass">
                        <span :class="logoClass" aria-hidden="true">{{ item.name.charAt(0) }}</span>
                        <MpText>{{ item.name }}</MpText>
                      </span>
                      <MpText :color="item.isConnected ? 'text.success' : 'text.secondary'">
                        {{ item.isConnected ? "Connected" : "Not connected" }}
                      </MpText>
                    </li>
                  </ul>
                  <MpText v-else color="text.secondary">No connections yet.</MpText>
                </section>
              </div>
            </MpTabPanel>

            <!-- ═════ Visibility ═════ -->
            <MpTabPanel>
              <div :class="panelClass">
                <section :class="sectionClass">
                  <MpText as="h3" size="h3">Who can use this agent</MpText>
                  <MpText color="text.secondary">
                    Everyone at {{ workspace.name }} · {{ people.length }} people
                  </MpText>
                  <ul :class="rowsClass">
                    <li v-for="person in people" :key="person.id" :class="rowClass">
                      <span :class="inlineClass">
                        <MemberAvatar :actor="{ kind: 'person', id: person.id }" />
                        <span :class="rowTextClass">
                          <MpText>{{ person.name }}</MpText>
                          <MpText size="label-small" color="text.secondary">
                            {{ person.title }}
                          </MpText>
                        </span>
                      </span>
                    </li>
                  </ul>
                </section>
              </div>
            </MpTabPanel>

            <!-- ═════ Usage ═════ -->
            <MpTabPanel>
              <div :class="panelClass">
                <section :class="sectionClass">
                  <div>
                    <MpText as="h3" size="h3">Total cost</MpText>
                    <MpText size="label-small" color="text.secondary">
                      Model and tool usage · last {{ USAGE_DAYS }} days
                    </MpText>
                  </div>
                  <template v-if="usage.total">
                    <div :class="statsClass">
                      <div>
                        <MpText size="label-small" color="text.secondary">Total cost</MpText>
                        <MpText weight="semiBold">{{ formatRupiah(usage.total) }}</MpText>
                      </div>
                      <div>
                        <MpText size="label-small" color="text.secondary">Average per day</MpText>
                        <MpText>{{ formatRupiah(usage.average) }}</MpText>
                      </div>
                    </div>
                    <AgentUsageChart :days="usage.days" />
                    <MpText size="label-small" color="text.secondary">
                      Cost is estimated from model tokens and tool calls, and may take up to 24
                      hours to update.
                    </MpText>
                  </template>
                  <MpText v-else color="text.secondary">No usage yet.</MpText>
                </section>

                <section :class="sectionClass">
                  <MpText as="h3" size="h3">Groups it's in</MpText>
                  <ul v-if="groups.length" :class="linksClass">
                    <li v-for="group in groups" :key="group.id">
                      <NuxtLink :to="conversationPath(workspace.id, group.slug)" :class="linkClass">
                        {{ conversationLabel(group) }}
                      </NuxtLink>
                    </li>
                  </ul>
                  <MpText v-else color="text.secondary">
                    Not in any group yet. Add it from a group's member list.
                  </MpText>
                </section>

                <section :class="sectionClass">
                  <MpText as="h3" size="h3">Recent artifacts</MpText>
                  <ul v-if="outputs.length" :class="linksClass">
                    <li v-for="output in outputs" :key="output.id">
                      <NuxtLink :to="outputLink(output)" :class="linkClass">
                        {{ output.title }}
                      </NuxtLink>
                      <MpText size="label-small" color="text.secondary">
                        Updated {{ formatTimestamp(lastUpdate(output)) }}
                      </MpText>
                    </li>
                  </ul>
                  <MpText v-else color="text.secondary">No artifacts yet.</MpText>
                </section>
              </div>
            </MpTabPanel>
          </MpTabPanels>
        </MpTabs>
      </PageContent>
    </template>

    <template v-else>
      <PageHeader title="Agent not found" />
      <PageContent>
        <MpText color="text.secondary">This agent doesn't exist or was removed.</MpText>
      </PageContent>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import {
  css,
  MpBadge,
  MpButton,
  MpIcon,
  MpTab,
  MpTabList,
  MpTabPanel,
  MpTabPanels,
  MpTabs,
  MpText
} from "@mekari/pixel3";
import PageContent from "~/components/layout/PageContent.vue";
import PageHeader from "~/components/layout/PageHeader.vue";
import AgentUsageChart from "~/components/pages/AgentUsageChart.vue";
import MemberAvatar from "~/components/shared/MemberAvatar.vue";
import { useChatStore } from "~/composables/useChatStore";
import { useCurrentWorkspace } from "~/composables/useCurrentWorkspace";
import { useWorkspaceStore } from "~/composables/useWorkspaceStore";
import { getAgent } from "~/data/agents";
import { getPerson } from "~/data/people";
import type { Output, Person } from "~/data/types";
import { USAGE_DAYS, agentUsage } from "~/utils/agent-usage";
import { SKILL_EFFECTS, agentProfile } from "~/utils/agents";
import { formatDate, formatRupiah, formatTimestamp } from "~/utils/format";
import { conversationPath, newAgentChatRoute, threadPath, workspacePath } from "~/utils/paths";

const TABS = ["Overview", "Knowledge", "Skills", "Connections", "Visibility", "Usage"];

/** Outputs listed before the Library takes over. */
const RECENT_OUTPUTS = 5;

const route = useRoute();
const { workspace } = useCurrentWorkspace();
const { channelsIn, conversationLabel, getConversationById } = useWorkspaceStore();
const { outputsFor } = useChatStore();

const tab = ref(0);

const agent = computed(() => getAgent(String(route.params.agentId)));

// Another agent starts on Overview.
watch(
  () => agent.value?.id,
  () => (tab.value = 0)
);

const agentsPath = computed(() =>
  workspace.value ? `${workspacePath(workspace.value.id)}/agents` : "/"
);

const profile = computed(() => agentProfile(agent.value!));
const usage = computed(() => agentUsage(agent.value!));

/** Built-in agents come from Mekari; custom ones show who made them and when. */
const maker = computed(() => {
  const createdBy = agent.value?.createdBy ? getPerson(agent.value.createdBy) : undefined;
  if (!createdBy || !agent.value?.createdAt) return "Mekari";
  return `${createdBy.name}, ${formatDate(agent.value.createdAt)}`;
});

const people = computed(() =>
  (workspace.value?.members ?? [])
    .map((member) => getPerson(member.personId))
    .filter((person): person is Person => Boolean(person))
);

const groups = computed(() =>
  workspace.value && agent.value
    ? channelsIn(workspace.value.id).filter((group) => group.agentIds.includes(agent.value!.id))
    : []
);

function lastUpdate(output: Output): string {
  return output.versions.at(-1)?.createdAt ?? "";
}

// Newest first; an output counts if the agent wrote any of its versions.
const outputs = computed(() =>
  workspace.value && agent.value
    ? outputsFor(workspace.value.id)
        .filter((output) => output.versions.some((version) => version.agentId === agent.value!.id))
        .sort((a, b) => lastUpdate(b).localeCompare(lastUpdate(a)))
        .slice(0, RECENT_OUTPUTS)
    : []
);

useHead({ title: () => agent.value?.name ?? "Agent not found" });

/** The conversation it was made in, with the output open in the preview. */
function outputLink(output: Output) {
  const conversation = getConversationById(output.threadId);
  if (!workspace.value || !conversation) return "";
  return {
    path: threadPath(workspace.value.id, conversation),
    query: { output: output.id }
  };
}

const pageClass = css({ display: "flex", flexDirection: "column", flex: "1", minH: "0" });

const introClass = css({ display: "flex", alignItems: "flex-start", gap: "5", mb: "8" });

const introIconClass = css({ w: "72px", h: "72px", objectFit: "contain", flexShrink: "0" });

const introTextClass = css({ display: "flex", flexDirection: "column", minW: "0", pt: "1" });

// Tab content reads at a comfortable width; the tab bar spans the page.
const panelClass = css({
  display: "flex",
  flexDirection: "column",
  gap: "8",
  maxW: "960px",
  pt: "2"
});

const sectionClass = css({ display: "flex", flexDirection: "column", gap: "2" });

const inlineClass = css({ display: "inline-flex", alignItems: "center", gap: "2" });

const rowsClass = css({ display: "flex", flexDirection: "column" });

const rowClass = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "4",
  py: "3",
  borderBottomWidth: "1px",
  borderColor: "border.default"
});

const rowTextClass = css({ display: "flex", flexDirection: "column", gap: "0.5", minW: "0" });

const chipsClass = css({ display: "flex", flexWrap: "wrap", gap: "2" });

const chipClass = css({ px: "3", py: "1", rounded: "full", bg: "background.neutral.subtle" });

const pillClass = css({
  flexShrink: "0",
  px: "3",
  py: "1",
  rounded: "full",
  bg: "background.neutral.subtle"
});

// Stands in for the service's logo until we have the real marks.
const logoClass = css({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  w: "8",
  h: "8",
  rounded: "md",
  bg: "background.neutral.subtle",
  color: "text.secondary",
  fontWeight: "semiBold"
});

const statsClass = css({ display: "flex", gap: "10", py: "2" });

// Enterprise links are green: text.selected, since Pixel's text.link stays blue there.
const linkClass = css({
  color: "text.selected",
  textDecoration: "none",
  _hover: { textDecoration: "underline" },
  _focusVisible: { outline: "2px solid", outlineColor: "border.focused", rounded: "sm" }
});

const linksClass = css({
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  gap: "2"
});
</script>
