export const IDLE_LIMIT_MS = 30 * 60 * 1000;
export const MAX_BEATS_PER_VISIT = 120;

/** Pure decision: should a heartbeat be sent right now? */
export function shouldBeat({ now, lastActivity, beatsSent, visible, hasVisit }) {
  if (!visible || !hasVisit) return false;
  if (beatsSent >= MAX_BEATS_PER_VISIT) return false;
  if (now - lastActivity > IDLE_LIMIT_MS) return false;
  return true;
}
