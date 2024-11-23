const debounceMap: { [key: string]: ReturnType<typeof setTimeout> | null } = {};

export interface DebouncedFn<T extends (...args: unknown[]) => void> {
  (...args: Parameters<T>): void;
  clear: () => void;
}

export default function debounceWithKey<T extends (...args: unknown[]) => void>(
  key: string,
  fn: T,
  wait: number,
  autoExecute: boolean = true,
  ...args: Parameters<T>
): DebouncedFn<T> {
  function debouncedFn(this: unknown, ...innerArgs: Parameters<T>): void {
    const later = () => {
      debounceMap[key] = null;
      fn.apply(this, innerArgs.length ? innerArgs : args);
    };

    if (debounceMap[key]) {
      clearTimeout(debounceMap[key] as ReturnType<typeof setTimeout>);
    }

    debounceMap[key] = setTimeout(later, wait);
  }

  debouncedFn.clear = () => {
    if (debounceMap[key]) {
      clearTimeout(debounceMap[key] as ReturnType<typeof setTimeout>);
      debounceMap[key] = null;
    }
  };

  if (autoExecute) {
    debouncedFn(...args);
  }

  return debouncedFn as DebouncedFn<T>;
}
