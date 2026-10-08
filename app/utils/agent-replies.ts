import {
  AGENT_SCRIPTS,
  FALLBACK_REPLY,
  LATEST_VERSION_REPLY,
  type AgentAsk,
  type AgentConsult,
  type AgentIntent
} from "~/data/agent-scripts";
import { OUTPUT_TEMPLATES, type OutputTemplateVersion } from "~/data/output-templates";
import type { OutputFormat } from "~/data/types";

export interface PickedReply {
  /** Reply text; "{sender}" still needs filling */
  reply: string;
  title?: string;
  output?: {
    templateKey: string;
    title: string;
    kind: string;
    format?: OutputFormat;
    version: OutputTemplateVersion;
  };
  /** The agent asks this (with options) instead of writing the output yet */
  ask?: AgentAsk & { outputKey: string };
  /** Agents to check with before this reply goes out */
  consult?: AgentConsult[];
}

/** How many versions of an output already exist in the conversation. */
type VersionCount = (templateKey: string) => number;

function matches(intent: AgentIntent, text: string): boolean {
  const lower = text.toLowerCase();
  if (intent.maxWords && lower.split(/\s+/).filter(Boolean).length > intent.maxWords) return false;
  return intent.keywords.some((keyword) => lower.includes(keyword));
}

/**
 * Picks a scripted reply. `text` should already have @mentions removed so agent names
 * don't trigger keywords. Asking for an output again moves to its next version.
 */
export function pickAgentReply(
  agentId: string,
  text: string,
  versionCount: VersionCount
): PickedReply {
  const script = AGENT_SCRIPTS[agentId];
  if (!script) return { reply: FALLBACK_REPLY };

  const intent = script.intents.find((item) => matches(item, text)) ?? script.default;
  const consult = intent.consult;
  const template = intent.outputKey ? OUTPUT_TEMPLATES[intent.outputKey] : undefined;
  if (!template) return { reply: intent.reply ?? FALLBACK_REPLY, consult };

  // The first time an output is asked for here, an agent with a question asks it first.
  if (intent.ask && versionCount(template.key) === 0) {
    return {
      reply: intent.ask.question,
      title: template.title,
      ask: { ...intent.ask, outputKey: template.key }
    };
  }

  return { ...pickOutputReply(template.key, versionCount(template.key)), consult };
}

/** The next version of a specific output, e.g. once someone has picked an option. */
export function pickOutputReply(outputKey: string, versionCount: number): PickedReply {
  const template = OUTPUT_TEMPLATES[outputKey];
  if (!template) return { reply: FALLBACK_REPLY };

  const version = template.versions[versionCount];
  if (!version) return { reply: LATEST_VERSION_REPLY, title: template.title };

  return {
    reply: version.reply,
    title: template.title,
    output: {
      templateKey: template.key,
      title: template.title,
      kind: template.kind,
      format: template.format,
      version
    }
  };
}

/**
 * What an agent says when another agent checks with it: the script's line, an output, or
 * its usual answer to the message. It never stops to ask a question with options here.
 */
export function pickConsultReply(
  consult: AgentConsult,
  text: string,
  versionCount: VersionCount
): PickedReply {
  if (consult.reply) return { reply: consult.reply };
  if (consult.outputKey) return pickOutputReply(consult.outputKey, versionCount(consult.outputKey));
  const picked = pickAgentReply(consult.agentId, text, versionCount);
  return picked.ask
    ? pickOutputReply(picked.ask.outputKey, versionCount(picked.ask.outputKey))
    : { ...picked, consult: undefined };
}
