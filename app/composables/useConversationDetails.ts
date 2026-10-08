import type { IconName } from "@mekari/pixel3";
import { useChatStore } from "~/composables/useChatStore";
import type { Conversation } from "~/data/types";
import { consultedAgentIds } from "~/utils/consults";
import { FILE_TYPES, fileFormat } from "~/utils/files";
import { OUTPUT_FORMATS } from "~/utils/outputs";

/**
 * A conversation's side panels: Members, from the faces in the header, and Files and
 * artifacts or Connectors, picked from the menu on the files pill beside them.
 */
export type ConversationPanelView = "members" | "files" | "connectors";

/** A row in a conversation's Files: an output written or shared there, or an attached file. */
export interface ConversationFile {
  id: string;
  kind: "output" | "file";
  name: string;
  icon: IconName;
  /** The format: "Doc", "Sheet", "Slides", "HTML" for artifacts; "PDF", "CSV" for files */
  caption: string;
  updatedAt: string;
  /** Latest version, for outputs */
  version?: number;
}

/** What a group or agent chat holds besides messages: its agents, files and connectors. */
export function useConversationDetails() {
  const { outputsFor, filesFor, messagesFor } = useChatStore();

  /** Outputs made or shared here, and files attached here, newest first. */
  function filesIn(conversation: Conversation): ConversationFile[] {
    const { id, workspaceId } = conversation;
    const outputs = outputsFor(workspaceId)
      .filter((output) => output.threadId === id || output.sharedThreadIds?.includes(id))
      .map<ConversationFile>((output) => {
        const latest = output.versions.at(-1)!;
        const format = OUTPUT_FORMATS[output.format ?? "doc"];
        return {
          id: output.id,
          kind: "output",
          name: output.title,
          icon: format.icon,
          caption: format.label,
          updatedAt: latest.createdAt,
          version: output.versions.length
        };
      });
    const attachments = filesFor(workspaceId)
      .filter((file) => file.threadId === id)
      .map<ConversationFile>((file) => ({
        id: file.id,
        kind: "file",
        name: file.name,
        icon: FILE_TYPES[file.type].icon,
        caption: fileFormat(file),
        updatedAt: file.uploadedAt
      }));
    return [...outputs, ...attachments].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  /** Agents brought into an agent chat to answer a question; groups don't consult. */
  function consultedIn(conversation: Conversation): string[] {
    return conversation.kind === "agent"
      ? consultedAgentIds(messagesFor(conversation.id), conversation.agentIds)
      : [];
  }

  /** Everyone's agents: a group's, or an agent chat's own agent and those it consulted. */
  function agentsIn(conversation: Conversation): string[] {
    return [...conversation.agentIds, ...consultedIn(conversation)];
  }

  return { filesIn, consultedIn, agentsIn };
}
