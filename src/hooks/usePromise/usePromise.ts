import { useCallback, useEffect, useRef, useState } from "react";

import useStableCurrentRef from "@hooks/useStableCurrentRef";

import customLogger from "@utils/customLogger";

// TODO: Reference https://developers.raycast.com/utilities/react-hooks/usepromise
//for possibile improvements to use `AbortController`.

type UsePromiseProps<T, A extends unknown[] = []> = {
  fn: (...args: A) => Promise<T>;
  onLoad?: (data: T) => void;
  onError?: (error: Error) => void;
  autoExecute: boolean;
  autoExecuteProps?: A;
};

/**
 * This hook provides a convenient way to handle asynchronous operations
 * with built-in state management for `pending`, `success`, and `error` states.
 *
 * @template T - The type of the data returned by the promise.
 * @template A - The type of the arguments passed to the promise function.
 *
 * @param {UsePromiseProps<T, A>} props - The properties for configuring the hook.
 * @param {(...args: A) => Promise<T>} props.fn - The function that returns a promise.
 * @param {(data: T) => void} [props.onLoad] - Optional callback invoked when the promise resolves successfully.
 * @param {(error: Error) => void} [props.onError] - Optional callback invoked when the promise is rejected.
 * @param {boolean} props.autoExecute - If true, the promise function is automatically executed on mount.
 * @param {A} [props.autoExecuteProps] - The arguments to use for the initial auto-execute. These are only evaluated once on the initial auto-execute and do not trigger re-evaluation if changed.
 *
 * @returns {{ data: T | null, isPending: boolean, error: Error | null, execute: (...args: A) => void }}
 * - `data`: The data returned by the promise, or null if not yet resolved.
 * - `isPending`: A boolean indicating if the promise is currently pending.
 * - `error`: The error returned by the promise, or null if not yet rejected.
 * - `execute`: A function to manually execute the promise with specific arguments.
 *
 * Note: The `autoExecuteProps` are only used for the initial auto-execute.
 * Changing them does not trigger a re-evaluation. To re-evaluate, call the `execute` function explicitly.
 */
export default function usePromise<T, A extends unknown[] = []>({
  fn,
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
  const hasLoggedWarningRef = useRef(false);

  const stableAutoExecuteProps = useStableCurrentRef(autoExecuteProps);
  const onLoadStableRef = useStableCurrentRef(onLoad);
  const fnStableRef = useStableCurrentRef(fn);
  const onErrorStableRef = useStableCurrentRef(onError);

  const execute = useCallback(
    (...args: A) => {
      if (pendingPromiseRef.current && !hasLoggedWarningRef.current) {
        customLogger.warn(
          "A new promise is being invoked while another is still pending. This might lead to unexpected behavior.",
        );
        hasLoggedWarningRef.current = true;
      }

      const onLoad = onLoadStableRef.current;
      const fn = fnStableRef.current;
      const onError = onErrorStableRef.current;

      setIsPending(true);
      setError(null);

      const newPromise = fn(...args);
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
    [fnStableRef, onLoadStableRef, onErrorStableRef],
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
