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
  props: Partial<UsePaginationProps> = DEFAULT_PAGINATION_PROPS
) {
  const mergedProps: Required<UsePaginationProps> = useMemo(
    () => ({ ...DEFAULT_PAGINATION_PROPS, ...props }),
    [props]
  );

  const [page, setPage] = useState<number>(mergedProps.initialPage);
  const [pageSize, setPageSize] = useState<number>(mergedProps.initialPageSize);

  const totalPages = useMemo(
    () => Math.ceil(mergedProps.totalItems / pageSize),
    [mergedProps.totalItems, pageSize]
  );

  const remaining = useMemo(
    () =>
      mergedProps.totalItems - ((page - 1) * pageSize + mergedProps.totalItems),
    [mergedProps.totalItems, page, pageSize]
  );

  const resetPagination = useCallback(() => {
    setPage(DEFAULT_PAGINATION_PROPS.initialPage);
  }, []);

  return {
    page,
    setPage,
    pageSize,
    setPageSize,
    totalPages,
    remaining,
    resetPagination,
  };
}
