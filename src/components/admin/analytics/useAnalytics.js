import { useEffect, useState } from 'react';

// fetcher: () => Promise. Re-runs when deps change; stale responses are ignored.
export function useAnalytics(fetcher, deps) {
  const [state, setState] = useState({ data: null, loading: true, error: null });

  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));
    Promise.resolve()
      .then(fetcher)
      .then((data) => { if (!cancelled) setState({ data, loading: false, error: null }); })
      .catch((error) => {
        console.error('Analytics fetch failed:', error);
        if (!cancelled) setState({ data: null, loading: false, error });
      });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return state;
}

export default useAnalytics;
