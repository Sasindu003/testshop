import { useCallback, useState } from 'react';

/**
 * Wraps a paginated API function.
 * apiFn must accept { page, limit, ...otherParams } and return
 * a response whose data contains { docs/items, totalPages, currentPage, total }.
 *
 * @param {Function} apiFn
 * @param {Object}   defaultParams  - merged with page/limit on every call
 * @param {number}   defaultLimit
 */
export function usePagination(apiFn, defaultParams = {}, defaultLimit = 12) {
  const [data, setData] = useState([]);
  const [meta, setMeta] = useState({ currentPage: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetch = useCallback(
    async (page = 1, extraParams = {}) => {
      setLoading(true);
      setError(null);
      try {
        const res = await apiFn({ page, limit: defaultLimit, ...defaultParams, ...extraParams });
        const payload = res.data;
        // Support both { docs, ... } and { items, ... } shapes
        setData(payload.docs ?? payload.items ?? payload.products ?? []);
        setMeta({
          currentPage: payload.currentPage ?? page,
          totalPages: payload.totalPages ?? 1,
          total: payload.total ?? 0,
        });
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    },
    [apiFn, defaultLimit, JSON.stringify(defaultParams)], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const goToPage = useCallback((page, extra) => fetch(page, extra), [fetch]);

  return { data, meta, loading, error, fetch, goToPage };
}
