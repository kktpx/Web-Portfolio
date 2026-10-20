export const SECTION_VIEW_THRESHOLD = 0.4;

// Dense thresholds so the callback re-fires as visible height grows (tall sections).
export const SECTION_THRESHOLDS = Array.from({ length: 21 }, (_, i) => i / 20);

// A section counts as viewed when 40% of it is visible, or when it fills at
// least 40% of the viewport height (sections taller than ~2.5 viewports can
// never reach a 0.4 intersection ratio).
export function isSectionViewed(entry, viewportHeight) {
  if (!entry.isIntersecting) return false;
  if (entry.intersectionRatio >= SECTION_VIEW_THRESHOLD) return true;
  return entry.intersectionRect.height >= SECTION_VIEW_THRESHOLD * viewportHeight;
}
