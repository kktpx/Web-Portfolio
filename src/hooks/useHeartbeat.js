import { useEffect } from 'react';
import { trackEvent } from '../services/analyticsService';
import { hasActiveVisit } from '../utils/analytics';
import { shouldBeat } from '../utils/heartbeatPolicy';

export const HEARTBEAT_INTERVAL_MS = 15000;
const ACTIVITY_EVENTS = ['pointerdown', 'keydown', 'scroll', 'mousemove'];

export default function useHeartbeat() {
  useEffect(() => {
    let lastActivity = Date.now();
    let beatsSent = 0;
    const onActivity = () => {
      lastActivity = Date.now();
    };
    ACTIVITY_EVENTS.forEach((e) =>
      window.addEventListener(e, onActivity, { passive: true }),
    );

    const id = setInterval(() => {
      const now = Date.now();
      const ok = shouldBeat({
        now,
        lastActivity,
        beatsSent,
        visible: document.visibilityState === 'visible',
        hasVisit: hasActiveVisit(now),
      });
      if (ok) {
        beatsSent += 1;
        trackEvent('heartbeat');
      }
    }, HEARTBEAT_INTERVAL_MS);

    return () => {
      clearInterval(id);
      ACTIVITY_EVENTS.forEach((e) => window.removeEventListener(e, onActivity));
    };
  }, []);
}
