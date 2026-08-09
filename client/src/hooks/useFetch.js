import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Fetches data immediately on mount (and on deps change).
 * Re-exports { data, loading, error, refetch }.
 *
 * @param {Function} apiFn - async function called with `params`
 * @param {Object}   params - passed to apiFn on every call
 * @param {boolean}  skip   - set true to defer the initial fetch
 */
export function useFetch(apiFn, params = {}, { skip = false } = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(!skip);
  const [error, setError] = useState(null);
  // stable ref so effect can use latest params without re-subscribing
  const paramsRef = useRef(params);
  paramsRef.current = params;

  const fetch = useCallback(
    async (overrideParams) => {
      setLoading(true);
      setError(null);
      try {
        const res = await apiFn(overrideParams ?? paramsRef.current);
        setData(res.data);
        return res.data;
      } catch (err) {
        const msg =
          err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          'Something went wrong';
        setError(msg);
      } finally {
        setLoading(false);
      }
    },
    [apiFn],
  );

  useEffect(() => {
    if (!skip) fetch();
  }, [skip, fetch]); // eslint-disable-line react-hooks/exhaustive-deps

  return { data, loading, error, refetch: fetch };
}
