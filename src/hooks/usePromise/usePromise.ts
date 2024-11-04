import { useCallback, useEffect, useRef, useState } from "react";

import useStableCurrentRef from "@hooks/useStableCurrentRef";

import customLogger from "@utils/customLogger";

type UsePromiseProps<T> = {
  promiseFunction: () => Promise<T>;
  onLoad?: (data: T) => void;
  onError?: (error: Error) => void;
  autoExecute: boolean;
};

/**
 * This hook provides a convenient way to handle asynchronous operations
 * with built-in state management for `pending`, `success`, and `error` states.
 */
export default function usePromise<T>({
  promiseFunction,
  onLoad,
  onError,
  autoExecute,
}: UsePromiseProps<T>) {
  const [data, setData] = useState<T | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const hasAutoExecutedRef = useRef(false);
  const pendingPromiseRef = useRef<Promise<T> | null>(null);

  const onLoadStableRef = useStableCurrentRef(onLoad);
  const promiseFunctionStableRef = useStableCurrentRef(promiseFunction);
  const onErrorStableRef = useStableCurrentRef(onError);

  const execute = useCallback(() => {
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

    const newPromise = promiseFunction();
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
  }, [promiseFunctionStableRef, onLoadStableRef, onErrorStableRef]);

  useEffect(() => {
    if (autoExecute && !hasAutoExecutedRef.current) {
      execute();
      hasAutoExecutedRef.current = true;
    }
  }, [autoExecute, execute]);

  return { data, isPending, error, execute };
}
