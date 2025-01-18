import { useCallback, useEffect, useRef, useState } from "react";

import useStableCurrentRef from "@hooks/useStableCurrentRef";

// TODO: Reference https://developers.raycast.com/utilities/react-hooks/usepromise
//for possibile improvements to use `AbortController`.

type UsePromiseProps<T, A extends unknown[] = []> = {
  fn: (...args: A) => Promise<T>;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  initialAutoExecute: boolean;
  initialAutoExecuteProps?: A;
};

// TODO: Add an optional `autoExecuteProps` property which automatically executes
// whenever they change. It should conflict with `initialAutoExecuteProps`,
// erroring if they are both used together.
/**
 * This hook provides a convenient way to handle asynchronous operations
 * with built-in state management for `pending`, `success`, and `error` states.
 *
 * @template T - The type of the data returned by the promise.
 * @template A - The type of the arguments passed to the promise function.
 *
 * @param {UsePromiseProps<T, A>} props - The properties for configuring the hook.
 * @param {(...args: A) => Promise<T>} props.fn - The function that returns a promise.
 * @param {(data: T) => void} [props.onSuccess] - Optional callback invoked when the promise resolves successfully.
 * @param {(error: Error) => void} [props.onError] - Optional callback invoked when the promise is rejected.
 * @param {boolean} props.initialAutoExecute - If true, the promise function is automatically executed on mount.
 * @param {A} [props.initialAutoExecuteProps] - The arguments to use for the initial auto-execute. These are only evaluated once on the initial auto-execute and do not trigger re-evaluation if changed.
 *
 * @returns {{ data: T | null, isPending: boolean, error: Error | null, execute: (...args: A) => Promise<T> | void }}
 * - `data`: The data returned by the promise, or null if not yet resolved.
 * - `isPending`: A boolean indicating if the promise is currently pending.
 * - `error`: The error returned by the promise, or null if not yet rejected.
 * - `execute`: A function to manually execute the promise with specific arguments.
 */
export default function usePromise<T, A extends unknown[] = []>({
  fn,
  onSuccess,
  onError,
  initialAutoExecute,
  initialAutoExecuteProps,
}: UsePromiseProps<T, A>) {
  const [data, setData] = useState<T | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const hasinitialAutoExecutedRef = useRef(false);
  const pendingPromiseRef = useRef<Promise<T> | null>(null);
  // const hasLoggedWarningRef = useRef(false);

  const stableInitialAutoExecuteProps = useStableCurrentRef(
    initialAutoExecuteProps,
  );
  const onSuccessStableRef = useStableCurrentRef(onSuccess);
  const fnStableRef = useStableCurrentRef(fn);
  const onErrorStableRef = useStableCurrentRef(onError);

  const execute = useCallback(
    (...args: A) => {
      // FIXME: This is a good idea, but due to React Strict Mode, manually
      // invoking `execute` from a `useEffect` becomes problematic.
      //
      // if (pendingPromiseRef.current && !hasLoggedWarningRef.current) {
      //   customLogger.warn(
      //     "A new promise is being invoked while another is still pending. This might lead to unexpected behavior.",
      //   );
      //   hasLoggedWarningRef.current = true;
      // }

      const onSuccess = onSuccessStableRef.current;
      const fn = fnStableRef.current;
      const onError = onErrorStableRef.current;

      setIsPending(true);
      setError(null);

      const newPromise = fn(...args);
      pendingPromiseRef.current = newPromise;

      return newPromise
        .then((result) => {
          if (pendingPromiseRef.current === newPromise) {
            setData(result);
            if (onSuccess) {
              onSuccess(result);
            }
          }

          return result;
        })
        .catch((error) => {
          if (pendingPromiseRef.current === newPromise) {
            // Clear data on error
            setData(null);

            setError(error);
            if (onError) {
              onError(error);
            }
          }
        })
        .finally((result: T | void) => {
          if (pendingPromiseRef.current === newPromise) {
            pendingPromiseRef.current = null;
            setIsPending(false);

            return result;
          }
        });
    },
    [fnStableRef, onSuccessStableRef, onErrorStableRef],
  );

  useEffect(() => {
    if (initialAutoExecute && !hasinitialAutoExecutedRef.current) {
      const initialAutoExecuteProps = stableInitialAutoExecuteProps.current;

      execute(...(initialAutoExecuteProps || ([] as unknown as A)));
      hasinitialAutoExecutedRef.current = true;
    }
  }, [initialAutoExecute, stableInitialAutoExecuteProps, execute]);

  const reset = useCallback(() => {
    setData(null);
    setIsPending(false);
    setError(null);
  }, []);

  return { data, isPending, error, execute, reset };
}
