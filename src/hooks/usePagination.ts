import { useCallback, useMemo, useState } from "react";

export type UsePaginationProps = {
  initialPage?: number;
  initialPageSize?: number;
  totalItems: number;
};

const DEFAULT_PAGINATION_PROPS: Required<UsePaginationProps> = {
  initialPage: 1,
  initialPageSize: 20,
  totalItems: 0,
};

export default function usePagination(
  props: Partial<UsePaginationProps> = DEFAULT_PAGINATION_PROPS,
) {
  const mergedProps: Required<UsePaginationProps> = useMemo(
    () => ({ ...DEFAULT_PAGINATION_PROPS, ...props }),
    [props],
  );

  const [page, _setPage] = useState<number>(mergedProps.initialPage);
  const [previousPage, _setPreviousPage] = useState<number | undefined>(
    undefined,
  );

  const [pageSize, setPageSize] = useState<number>(mergedProps.initialPageSize);

  const handleSetPage = useCallback((nextPage: number) => {
    _setPage((currentPage) => {
      if (currentPage !== nextPage) {
        _setPreviousPage(currentPage);
        return nextPage;
      }
      return currentPage;
    });
  }, []);

  const totalPages = useMemo(
    () => Math.ceil(mergedProps.totalItems / pageSize) || 1,
    [mergedProps.totalItems, pageSize],
  );

  const remaining = useMemo(() => {
    const calc = mergedProps.totalItems - page * pageSize;
    return calc > 0 ? calc : 0;
  }, [mergedProps.totalItems, page, pageSize]);

  const resetPagination = useCallback(() => {
    _setPage(DEFAULT_PAGINATION_PROPS.initialPage);
    _setPreviousPage(undefined);
  }, []);

  return {
    page,
    previousPage,
    setPage: handleSetPage,
    pageSize,
    setPageSize,
    totalPages,
    remaining,
    resetPagination,
  };
}
