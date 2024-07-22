import { useLocation, useNavigate } from "react-router-dom";
import { useCallback, useMemo, useEffect } from "react";

import useStableCurrentRef from "../useStableCurrentRef";

type URLState = {
  [key: string]: string | null;
};

type URLStateUpdater<T> = (prevState: T) => T;

/**
 * This React hook serves as a helper for `react-router-dom`, ensuring
 * consistent interception and construction of URL locations throughout
 * the app.
 *
 * As a rule of thumb, this should replace `useNavigate` in the app.
 */
export default function useURLState<T extends URLState>(
  onURLStateChange?: (urlState: T) => void
) {
  const location = useLocation();
  const navigate = useNavigate();

  const urlState = useMemo(() => {
    const searchParams = new URLSearchParams(location.search);
    const params: URLState = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });
    return params as T;
  }, [location.search]);

  const setURLState = useCallback(
    (
      nextState: Partial<T> | URLStateUpdater<Partial<T>>,
      isMerge = true,
      newPathname?: string
    ) => {
      const searchParams = new URLSearchParams(isMerge ? location.search : "");

      const stateToApply =
        typeof nextState === "function" ? nextState(urlState) : nextState;

      // Apply new state
      Object.keys(stateToApply).forEach((key) => {
        const value = stateToApply[key];
        if (value !== null && value !== undefined) {
          searchParams.set(key, value);
        } else {
          searchParams.delete(key);
        }
      });

      const finalPathname = newPathname || location.pathname;

      navigate(
        {
          pathname: finalPathname,
          search: searchParams.toString(),
        },
        { replace: true }
      );
    },
    [location, navigate, urlState]
  );

  const getBooleanParam = useCallback(
    (key: string, defaultValue: boolean = false): boolean => {
      const currentValue = urlState[key];
      if (currentValue === undefined || currentValue === null) {
        return defaultValue;
      }
      return currentValue === "true" || currentValue === "1";
    },
    [urlState]
  );

  const toBooleanParam = useCallback(
    (value: boolean, defaultValue?: boolean): string | null => {
      if (defaultValue !== undefined && value === defaultValue) {
        return null;
      }

      return value === true ? "true" : "false";
    },
    []
  );

  const onURLStateChangeStableRef = useStableCurrentRef(onURLStateChange);
  useEffect(() => {
    const onURLStateChange = onURLStateChangeStableRef.current;

    if (typeof onURLStateChange === "function") {
      onURLStateChange(urlState);
    }
  }, [urlState, onURLStateChangeStableRef]);

  return {
    urlState,
    setURLState,
    getBooleanParam,
    toBooleanParam,
  };
}
