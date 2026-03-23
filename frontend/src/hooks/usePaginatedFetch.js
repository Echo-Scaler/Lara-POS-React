import { useState, useEffect, useCallback } from "react";
import api from "../services/api";

/**
 * A generic hook that handles paginated fetch + search state for any list page.
 *
 * @param {string} endpoint  The API path (e.g. "/users", "/customers")
 * @param {object} [extraParams]  Additional query params that trigger re-fetch when they change
 *                                (e.g. { role: "admin" })
 * @returns {{
 *   items: any[],
 *   loading: boolean,
 *   pagination: { currentPage, lastPage, total, from, to },
 *   searchTerm: string,
 *   setSearchTerm: Function,
 *   setPage: Function,
 *   handleSearch: Function,
 *   handleClear: Function,
 * }}
 */
export function usePaginatedFetch(endpoint, extraParams = {}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    total: 0,
    from: 0,
    to: 0,
  });

  // Build query string from the current state
  const buildUrl = useCallback(
    (page) => {
      const params = new URLSearchParams({ page });
      if (searchTerm) params.set("search", searchTerm);
      Object.entries(extraParams).forEach(([k, v]) => {
        if (v !== "" && v != null) params.set(k, v);
      });
      return `${endpoint}?${params.toString()}`;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [endpoint, searchTerm, ...Object.values(extraParams)]
  );

  const fetchItems = useCallback(
    async (page = pagination.currentPage) => {
      setLoading(true);
      try {
        const res = await api.get(buildUrl(page));
        const responseData = res.data.data;

        // Handle both wrapped (ResourceCollection) and plain responses
        const list = responseData?.data ?? responseData;
        setItems(Array.isArray(list) ? list : []);

        if (responseData?.meta) {
          const { current_page, last_page, total, from, to } =
            responseData.meta;
          setPagination({ currentPage: current_page, lastPage: last_page, total, from, to });
        }
      } catch (err) {
        console.error(`[usePaginatedFetch] ${endpoint}`, err);
      } finally {
        setLoading(false);
      }
    },
    [buildUrl, pagination.currentPage, endpoint]
  );

  useEffect(() => {
    fetchItems(pagination.currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.currentPage, buildUrl]);

  const setPage = (page) =>
    setPagination((prev) => ({ ...prev, currentPage: page }));

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const handleClear = () => {
    setSearchTerm("");
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  return {
    items,
    loading,
    pagination,
    searchTerm,
    setSearchTerm,
    setPage,
    handleSearch,
    handleClear,
    refresh: () => fetchItems(pagination.currentPage),
  };
}
