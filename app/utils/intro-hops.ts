// Agent intros that have already hopped in. Module-level, so it outlives a thread remounting
// when you leave a group and come back; a reload clears it along with the messages.
const hopped = new Set<string>();

/** True the first time an intro asks and false after, so each hello hops in once. */
export function claimIntroHop(messageId: string): boolean {
  if (hopped.has(messageId)) return false;
  hopped.add(messageId);
  return true;
}
