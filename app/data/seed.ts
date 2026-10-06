import { AGENTS } from "~/data/agents";
import { OUTPUT_TEMPLATES } from "~/data/output-templates";
import { PEOPLE } from "~/data/people";
import { outputId, type ProjectSeed } from "~/data/project-seed";
import { HOLIDAY_BLEND_LAUNCH } from "~/data/projects/holiday-blend-launch";
import { MOBILE_ORDERING_APP } from "~/data/projects/mobile-ordering-app";
import type { Message, Output } from "~/data/types";
import { fillReply, parseMentions, type Mentionable } from "~/utils/mentions";

// Turns the readable project files into the records the stores start from.

const PROJECTS: ProjectSeed[] = [MOBILE_ORDERING_APP, HOLIDAY_BLEND_LAUNCH];

const DIRECTORY: Mentionable[] = [
  ...PEOPLE.map((person) => ({ kind: "person" as const, id: person.id, name: person.name })),
  ...AGENTS.map((agent) => ({ kind: "agent" as const, id: agent.id, name: agent.name }))
];

const AGENT_IDS = new Set(AGENTS.map((agent) => agent.id));

function buildThreads(project: ProjectSeed): { messages: Message[]; outputs: Output[] } {
  const messages: Message[] = [];
  const outputs: Output[] = [];

  for (const [threadId, entries] of Object.entries(project.threads)) {
    entries.forEach((entry, index) => {
      const id = `msg-${threadId}-${index}`;
      if (!entry.from) {
        messages.push({
          id,
          threadId,
          kind: "system",
          sender: { kind: "person", id: "" },
          text: entry.text ?? "",
          mentions: [],
          createdAt: entry.at
        });
        return;
      }

      const sender = {
        kind: AGENT_IDS.has(entry.from) ? "agent" : "person",
        id: entry.from
      } as const;
      const template = entry.output ? OUTPUT_TEMPLATES[entry.output] : undefined;

      // The same output asked for again in a thread becomes its next version.
      const outputRef = template ? outputId(threadId, template.key) : "";
      const existing = outputs.find((item) => item.id === outputRef);
      const version = template?.versions[existing?.versions.length ?? 0];

      if (template && version) {
        const asker = DIRECTORY.find((item) => item.id === entry.for);
        const reply = fillReply(version.reply, asker, template.title);
        const prefix = entry.prefix ?? "";
        const output = existing ?? {
          id: outputRef,
          workspaceId: project.workspace.id,
          threadId,
          templateKey: template.key,
          title: template.title,
          kind: template.kind,
          versions: []
        };
        if (!existing) outputs.push(output);
        output.versions.push({ agentId: entry.from, createdAt: entry.at, blocks: version.blocks });
        messages.push({
          id,
          threadId,
          kind: "message",
          sender,
          text: prefix + reply.text,
          mentions: reply.mentions.map((mention) => ({
            ...mention,
            start: mention.start + prefix.length,
            end: mention.end + prefix.length
          })),
          output: { outputId: outputRef, version: output.versions.length },
          createdAt: entry.at
        });
        return;
      }

      const text = entry.text ?? "";
      const options = entry.choice?.options.map((option, index) => ({
        id: `${id}-option-${index}`,
        ...option
      }));
      const picked = entry.choice?.picked;
      messages.push({
        id,
        threadId,
        kind: "message",
        sender,
        text,
        mentions: parseMentions(text, DIRECTORY),
        choice:
          entry.choice && options
            ? {
                outputKey: entry.choice.outputKey,
                options,
                pickedId: picked ? options[picked.index]?.id : undefined,
                pickedBy: picked?.by
              }
            : undefined,
        createdAt: entry.at
      });
    });
  }
  return { messages, outputs };
}

const built = PROJECTS.map(buildThreads);

export const SEED = {
  workspaces: PROJECTS.map((project) => project.workspace),
  conversations: PROJECTS.flatMap((project) => project.conversations),
  messages: built.flatMap((item) => item.messages),
  outputs: built.flatMap((item) => item.outputs),
  unread: Object.assign({}, ...PROJECTS.map((project) => project.unread)) as Record<string, number>,
  files: PROJECTS.flatMap((project) => project.files),
  todos: PROJECTS.flatMap((project) => project.todos),
  activity: PROJECTS.flatMap((project) => project.activity)
};
