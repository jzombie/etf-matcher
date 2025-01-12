// Simple no-cache mechanism, can be improved for PWA
(function () {
  const NO_CACHE_KEY = "no_cache";

  function getQueryParam(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
  }

  function setQueryParam(name, value) {
    const url = new URL(window.location);
    url.searchParams.set(name, value);
    window.history.replaceState(null, "", url.toString());
  }

  function removeQueryParam(name) {
    const url = new URL(window.location);
    url.searchParams.delete(name);
    window.history.replaceState(null, "", url.toString());
  }

  const noCacheParam = getQueryParam(NO_CACHE_KEY);
  const now = Math.floor(Date.now() / 1000);

  if (noCacheParam) {
    const timestamp = parseInt(noCacheParam, 10);
    if (isNaN(timestamp) || now - timestamp > 10) {
      setQueryParam(NO_CACHE_KEY, now);
      window.location.reload(true);
    } else {
      removeQueryParam(NO_CACHE_KEY);
      console.debug("Loaded with skip-cache");
    }
  } else {
    setQueryParam(NO_CACHE_KEY, now);
    window.location.reload(true);
  }
})();
