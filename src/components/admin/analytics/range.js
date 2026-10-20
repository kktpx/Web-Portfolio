export const RANGES = [
  { value: 1, label: '1 Day' },
  { value: 7, label: '7 Days' },
  { value: 30, label: '30 Days' },
];

// Returns ISO strings: to = now, from = now - days.
export function computeRange(days, now = new Date()) {
  const to = new Date(now.getTime());
  const from = new Date(to.getTime() - days * 24 * 60 * 60 * 1000);
  return { from: from.toISOString(), to: to.toISOString() };
}
