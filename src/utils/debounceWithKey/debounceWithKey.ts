const debounceMap: { [key: string]: ReturnType<typeof setTimeout> | null } = {};

interface DebouncedFunction<T extends (...args: unknown[]) => void> {
  (...args: Parameters<T>): void;
  clear: () => void;
}

export default function debounceWithKey<T extends (...args: unknown[]) => void>(
  key: string,
  func: T,
  wait: number,
  autoInvoke: boolean = true,
  ...args: Parameters<T>
): DebouncedFunction<T> {
  function debouncedFunction(this: unknown, ...innerArgs: Parameters<T>): void {
    const later = () => {
      debounceMap[key] = null;
      func.apply(this, innerArgs.length ? innerArgs : args);
    };

    if (debounceMap[key]) {
      clearTimeout(debounceMap[key] as ReturnType<typeof setTimeout>);
    }

    debounceMap[key] = setTimeout(later, wait);
  }

  debouncedFunction.clear = () => {
    if (debounceMap[key]) {
      clearTimeout(debounceMap[key] as ReturnType<typeof setTimeout>);
      debounceMap[key] = null;
    }
  };

  if (autoInvoke) {
    debouncedFunction(...args);
  }

  return debouncedFunction as DebouncedFunction<T>;
}
