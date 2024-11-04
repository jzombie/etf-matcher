import { useCallback, useEffect, useState } from "react";

import useStableCurrentRef from "@hooks/useStableCurrentRef";

type UsePromiseProps<T> = {
  promiseFunction: () => Promise<T>;
  onLoad?: (data: T) => void;
  onError?: (error: Error) => void;
  autoExecute: boolean;
};

export default function usePromise<T>({
  promiseFunction,
  onLoad,
  onError,
  autoExecute,
}: UsePromiseProps<T>) {
  const [data, setData] = useState<T | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const onLoadStableRef = useStableCurrentRef(onLoad);
  const promiseFunctionStableRef = useStableCurrentRef(promiseFunction);
  const onErrorStableRef = useStableCurrentRef(onError);

  const execute = useCallback(() => {
    const onLoad = onLoadStableRef.current;
    const promiseFunction = promiseFunctionStableRef.current;
    const onError = onErrorStableRef.current;
    setIsPending(true);
    setError(null);

    promiseFunction()
      .then((result) => {
        setData(result);
        if (onLoad) {
          onLoad(result);
        }
      })
      .catch((error) => {
        setError(error);
        if (onError) {
          onError(error);
        }
      })
      .finally(() => {
        setIsPending(false);
      });
  }, [promiseFunctionStableRef, onLoadStableRef, onErrorStableRef]);

  useEffect(() => {
    if (autoExecute) {
      execute();
    }
  }, [autoExecute, execute]);

  return { data, isPending, error, execute };
}
