import { useCallback, useEffect, useRef, useState } from "react";

import useStableCurrentRef from "@hooks/useStableCurrentRef";

import customLogger from "@utils/customLogger";

type UsePromiseProps<T, A extends unknown[] = []> = {
  promiseFunction: (...args: A) => Promise<T>;
  onLoad?: (data: T) => void;
  onError?: (error: Error) => void;
  autoExecute: boolean;
  autoExecuteProps?: A;
};

/**
 * This hook provides a convenient way to handle asynchronous operations
 * with built-in state management for `pending`, `success`, and `error` states.
 */
export default function usePromise<T, A extends unknown[] = []>({
  promiseFunction,
  onLoad,
  onError,
  autoExecute,
  autoExecuteProps,
}: UsePromiseProps<T, A>) {
  const [data, setData] = useState<T | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const hasAutoExecutedRef = useRef(false);
  const pendingPromiseRef = useRef<Promise<T> | null>(null);

  const stableAutoExecuteProps = useStableCurrentRef(autoExecuteProps);
  const onLoadStableRef = useStableCurrentRef(onLoad);
  const promiseFunctionStableRef = useStableCurrentRef(promiseFunction);
  const onErrorStableRef = useStableCurrentRef(onError);

  const execute = useCallback(
    (...args: A) => {
      if (pendingPromiseRef.current) {
        customLogger.warn(
          "A new promise is being invoked while another is still pending. This might lead to unexpected behavior.",
        );
      }

      const onLoad = onLoadStableRef.current;
      const promiseFunction = promiseFunctionStableRef.current;
      const onError = onErrorStableRef.current;

      setIsPending(true);
      setError(null);

      const newPromise = promiseFunction(...args);
      pendingPromiseRef.current = newPromise;

      newPromise
        .then((result) => {
          if (pendingPromiseRef.current === newPromise) {
            setData(result);
            if (onLoad) {
              onLoad(result);
            }
          }
        })
        .catch((error) => {
          if (pendingPromiseRef.current === newPromise) {
            setError(error);
            if (onError) {
              onError(error);
            }
          }
        })
        .finally(() => {
          if (pendingPromiseRef.current === newPromise) {
            pendingPromiseRef.current = null;
            setIsPending(false);
          }
        });
    },
    [promiseFunctionStableRef, onLoadStableRef, onErrorStableRef],
  );

  useEffect(() => {
    if (autoExecute && !hasAutoExecutedRef.current) {
      const autoExecuteProps = stableAutoExecuteProps.current;

      execute(...(autoExecuteProps || ([] as unknown as A)));
      hasAutoExecutedRef.current = true;
    }
  }, [autoExecute, stableAutoExecuteProps, execute]);

  return { data, isPending, error, execute };
}
