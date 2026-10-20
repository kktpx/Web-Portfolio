import { useEffect } from 'react';
import { trackEvent } from '../services/analyticsService';
import { getVisitId } from '../utils/analytics';
import { isSectionViewed } from '../utils/sectionViewed';

const memoryFired = new Set();

function firedKey(visitId) {
  return `analytics_sections_${visitId}`;
}

function readFired(visitId) {
  try {
    const raw = sessionStorage.getItem(firedKey(visitId));
    const arr = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

// Returns true the first time an id is seen for the given visit.
function markFired(visitId, id) {
  const memKey = `${visitId}:${id}`;
  if (memoryFired.has(memKey)) return false;
  const stored = readFired(visitId);
  if (stored.has(id)) {
    memoryFired.add(memKey);
    return false;
  }
  memoryFired.add(memKey);
  stored.add(id);
  try {
    sessionStorage.setItem(firedKey(visitId), JSON.stringify([...stored]));
  } catch {
    // in-memory set already records it
  }
  return true;
}

export default function useSectionTracking(ids) {
  const idsKey = ids.join('|');

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return undefined;
    const wanted = idsKey ? idsKey.split('|') : [];
    const observed = new Set();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const vh = entry.rootBounds ? entry.rootBounds.height : window.innerHeight;
          if (!isSectionViewed(entry, vh)) return;
          const id = entry.target.id;
          if (markFired(getVisitId(), id)) {
            trackEvent('section_view', { section: id });
          }
          observer.unobserve(entry.target);
        });
      },
      { threshold: [0, 0.4] }
    );

    const scan = () => {
      wanted.forEach((id) => {
        if (observed.has(id)) return;
        const el = document.getElementById(id);
        if (el) {
          observed.add(id);
          observer.observe(el);
        }
      });
      return observed.size === wanted.length;
    };

    // Elements may render later (lazy content, loader overlay): watch the DOM until all are found.
    let mutationObserver = null;
    if (!scan() && typeof MutationObserver !== 'undefined') {
      mutationObserver = new MutationObserver(() => {
        if (scan()) {
          mutationObserver.disconnect();
          mutationObserver = null;
        }
      });
      mutationObserver.observe(document.body, { childList: true, subtree: true });
    }

    return () => {
      observer.disconnect();
      if (mutationObserver) mutationObserver.disconnect();
    };
  }, [idsKey]);
}
