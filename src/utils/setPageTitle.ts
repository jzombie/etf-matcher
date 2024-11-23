export const DEFAULT_PAGE_TITLE = window.document.title;

export default function setPageTitle(nextPageTitle?: string | null) {
  const newPageTitle = nextPageTitle
    ? `${nextPageTitle} | ${DEFAULT_PAGE_TITLE}`
    : DEFAULT_PAGE_TITLE;

  window.document.title = newPageTitle;
}
