import type { Message } from "~/data/types";

/** A run of messages from agents that another agent brought in, shown under one label. */
export interface ConsultRun {
  /** The agent that asked */
  by: string;
  /** Who answered, in order, each once */
  agentIds: string[];
  messages: Message[];
}

/**
 * Splits a conversation into plain messages and consult runs: back-to-back messages that
 * answer the same asking agent. Both chat views label each run "Messages from …".
 */
export function groupConsults(messages: Message[]): (Message | ConsultRun)[] {
  const items: (Message | ConsultRun)[] = [];
  messages.forEach((message) => {
    const last = items.at(-1);
    if (!message.consultedBy) {
      items.push(message);
    } else if (last && "by" in last && last.by === message.consultedBy) {
      last.messages.push(message);
      if (!last.agentIds.includes(message.sender.id)) last.agentIds.push(message.sender.id);
    } else {
      items.push({ by: message.consultedBy, agentIds: [message.sender.id], messages: [message] });
    }
  });
  return items;
}

export function isConsultRun(item: Message | ConsultRun): item is ConsultRun {
  return "by" in item;
}
