import type { ActorKind, Mention } from "~/data/types";

/** Someone who can be @mentioned in a conversation. */
export interface Mentionable {
  kind: ActorKind;
  id: string;
  name: string;
  /** Second line in the suggestion list, e.g. a job title or agent role */
  description?: string;
}

export interface MentionTrigger {
  /** Index of the "@" in the text */
  start: number;
  query: string;
}

export type TextSegment =
  { type: "text"; text: string } | { type: "mention"; text: string; mention: Mention };

const MAX_QUERY_LENGTH = 32;

/**
 * The "@" the caret is completing, if any. Recomputed from the text on every change,
 * so nothing has to stay in sync through deletes, caret moves or paste.
 */
export function findMentionTrigger(text: string, caret: number): MentionTrigger | null {
  const before = text.slice(0, caret);
  const start = before.lastIndexOf("@");
  if (start === -1) return null;

  const charBefore = start === 0 ? "" : before.charAt(start - 1);
  if (charBefore && !/\s/.test(charBefore)) return null;

  const query = before.slice(start + 1);
  if (query.includes("\n") || query.length > MAX_QUERY_LENGTH) return null;
  return { start, query };
}

/** Matches by full-name or word prefix; agents first because they're why people type "@" here. */
export function filterMentionables(items: Mentionable[], query: string, limit = 8): Mentionable[] {
  const needle = query.trim().toLowerCase();
  const matches = items.filter((item) => {
    if (!needle) return true;
    const name = item.name.toLowerCase();
    return name.startsWith(needle) || name.split(/\s+/).some((word) => word.startsWith(needle));
  });
  const agents = matches.filter((item) => item.kind === "agent");
  const people = matches.filter((item) => item.kind === "person");
  return [...agents, ...people].slice(0, limit);
}

/** Finds "@Name" tokens for known members, longest names first so "Design agent" beats "Design". */
export function parseMentions(text: string, mentionables: Mentionable[]): Mention[] {
  const candidates = [...mentionables].sort((a, b) => b.name.length - a.name.length);
  const mentions: Mention[] = [];
  let index = text.indexOf("@");

  while (index !== -1) {
    const charBefore = index === 0 ? "" : text.charAt(index - 1);
    let next = index + 1;

    if (!charBefore || /[\s(]/.test(charBefore)) {
      const rest = text.slice(index + 1).toLowerCase();
      const match = candidates.find(
        (item) =>
          rest.startsWith(item.name.toLowerCase()) && !/\w/.test(rest.charAt(item.name.length))
      );
      if (match) {
        const end = index + 1 + match.name.length;
        mentions.push({ kind: match.kind, id: match.id, start: index, end });
        next = end;
      }
    }
    index = text.indexOf("@", next);
  }
  return mentions;
}

export function toSegments(text: string, mentions: Mention[]): TextSegment[] {
  const segments: TextSegment[] = [];
  let cursor = 0;
  for (const mention of [...mentions].sort((a, b) => a.start - b.start)) {
    if (mention.start > cursor)
      segments.push({ type: "text", text: text.slice(cursor, mention.start) });
    segments.push({ type: "mention", text: text.slice(mention.start, mention.end), mention });
    cursor = mention.end;
  }
  if (cursor < text.length) segments.push({ type: "text", text: text.slice(cursor) });
  return segments;
}

/** Drops the punctuation a removed "{sender}" leaves behind: "step, ." → "step." */
function tidyWithoutSender(text: string): string {
  const tidy = text
    .replace(/\s+,/g, ",")
    .replace(/,\s*(?=[,.!?])/g, "")
    .replace(/^\s*,\s*/, "")
    .trim();
  return tidy.charAt(0).toUpperCase() + tidy.slice(1);
}

/**
 * Fills "{sender}" with an @mention of the asker and "{title}" with plain text.
 * Without a sender (a 1:1 agent chat) the mention is left out.
 */
export function fillReply(
  template: string,
  sender: Mentionable | undefined,
  title = ""
): { text: string; mentions: Mention[] } {
  const parts = template.replaceAll("{title}", title).split("{sender}");
  const mentions: Mention[] = [];
  let text = parts[0] ?? "";

  for (const part of parts.slice(1)) {
    if (sender) {
      const start = text.length;
      text += `@${sender.name}`;
      mentions.push({ kind: sender.kind, id: sender.id, start, end: text.length });
    }
    text += part;
  }
  return { text: sender ? text : tidyWithoutSender(text), mentions };
}

/** Text that carries its own @mentions, so pieces can be joined without losing them. */
export interface RichText {
  text: string;
  mentions: Mention[];
}

/** Joins plain and mention-carrying pieces into one text, shifting each piece's mentions. */
export function joinRich(...parts: (string | RichText)[]): RichText {
  return parts.reduce<RichText>(
    (result, part) => {
      const piece = typeof part === "string" ? { text: part, mentions: [] } : part;
      const offset = result.text.length;
      return {
        text: result.text + piece.text,
        mentions: [
          ...result.mentions,
          ...piece.mentions.map((mention) => ({
            ...mention,
            start: mention.start + offset,
            end: mention.end + offset
          }))
        ]
      };
    },
    { text: "", mentions: [] }
  );
}

/** "@Copywriter, @Social media planner and @Campaign analyst", each name a mention. */
export function mentionList(items: Mentionable[]): RichText {
  return joinRich(
    ...items.flatMap((item, index) => {
      const separator = index === 0 ? "" : index === items.length - 1 ? " and " : ", ";
      const mention: RichText = {
        text: `@${item.name}`,
        mentions: [{ kind: item.kind, id: item.id, start: 0, end: item.name.length + 1 }]
      };
      return [separator, mention];
    })
  );
}

/** The text with its @mentions cut out, e.g. so agent names don't trigger reply keywords. */
export function withoutMentions(text: string, mentions: Mention[]): string {
  return [...mentions]
    .sort((a, b) => b.start - a.start)
    .reduce((result, mention) => result.slice(0, mention.start) + result.slice(mention.end), text);
}
