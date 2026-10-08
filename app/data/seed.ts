import { AGENTS } from "~/data/agents";
import { CENTRAL_PERK } from "~/data/central-perk";
import { OUTPUT_TEMPLATES } from "~/data/output-templates";
import { PEOPLE } from "~/data/people";
import { outputId, type WorkspaceSeed } from "~/data/seed-helpers";
import type { Mention, Message, Output } from "~/data/types";
import { fillReply, parseMentions, type Mentionable } from "~/utils/mentions";

// Turns the readable mock content into the records the stores start from.

const DIRECTORY: Mentionable[] = [
  ...PEOPLE.map((person) => ({ kind: "person" as const, id: person.id, name: person.name })),
  ...AGENTS.map((agent) => ({ kind: "agent" as const, id: agent.id, name: agent.name }))
];

const AGENT_IDS = new Set(AGENTS.map((agent) => agent.id));

/** Moves mentions found in a reply along by the length of the text put in front of it. */
function shift(mentions: Mention[], by: number): Mention[] {
  return mentions.map((mention) => ({
    ...mention,
    start: mention.start + by,
    end: mention.end + by
  }));
}

function buildThreads(seed: WorkspaceSeed): { messages: Message[]; outputs: Output[] } {
  const messages: Message[] = [];
  const outputs: Output[] = [];
  /** Outputs shared from agent chats; applied once every thread is built */
  const shares: { outputId: string; threadId: string }[] = [];

  for (const [threadId, entries] of Object.entries(seed.threads)) {
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

      if (entry.shared) {
        const sharedId = outputId(entry.shared.threadId, entry.shared.output);
        shares.push({ outputId: sharedId, threadId });
        messages.push({
          id,
          threadId,
          kind: "message",
          sender,
          text: entry.text ?? "",
          mentions: parseMentions(entry.text ?? "", DIRECTORY),
          output: { outputId: sharedId, version: entry.shared.version ?? 1 },
          createdAt: entry.at
        });
        return;
      }
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
          workspaceId: seed.workspace.id,
          threadId,
          templateKey: template.key,
          title: template.title,
          kind: template.kind,
          format: template.format,
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
          mentions: [...parseMentions(prefix, DIRECTORY), ...shift(reply.mentions, prefix.length)],
          output: { outputId: outputRef, version: output.versions.length },
          consultedBy: entry.consultedBy,
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
        fileIds: entry.files,
        consultedBy: entry.consultedBy,
        createdAt: entry.at
      });
    });
  }
  shares.forEach(({ outputId: id, threadId }) => {
    const output = outputs.find((item) => item.id === id);
    if (output) output.sharedThreadIds = [...(output.sharedThreadIds ?? []), threadId];
  });
  return { messages, outputs };
}

const built = buildThreads(CENTRAL_PERK);

export const SEED = {
  workspaces: [CENTRAL_PERK.workspace],
  conversations: CENTRAL_PERK.conversations,
  messages: built.messages,
  outputs: built.outputs,
  unread: { ...CENTRAL_PERK.unread },
  files: CENTRAL_PERK.files,
  todos: CENTRAL_PERK.todos,
  activity: CENTRAL_PERK.activity
};
