import { useLocation, useNavigate } from "react-router-dom";
import { useCallback, useMemo, useEffect } from "react";

import useStableCurrentRef from "./useStableCurrentRef";

type URLState = {
  [key: string]: string | null;
};

type URLStateUpdater = (prevState: URLState) => URLState;

export default function useURLState(
  onURLStateChange?: (urlState: URLState) => void
) {
  const location = useLocation();
  const navigate = useNavigate();

  const urlState = useMemo(() => {
    const searchParams = new URLSearchParams(location.search);
    const params: URLState = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });
    return params;
  }, [location.search]);

  const setURLState = useCallback(
    (nextState: URLState | URLStateUpdater, isMerge = true) => {
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

      navigate(
        {
          pathname: location.pathname,
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
      console.log({ value, defaultValue });

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
