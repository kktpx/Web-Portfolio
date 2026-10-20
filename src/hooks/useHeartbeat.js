import { useEffect } from 'react';
import { trackEvent } from '../services/analyticsService';

export const HEARTBEAT_INTERVAL_MS = 15000;

export default function useHeartbeat() {
  useEffect(() => {
    const id = setInterval(() => {
      if (document.visibilityState === 'visible') {
        trackEvent('heartbeat');
      }
    }, HEARTBEAT_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);
}
