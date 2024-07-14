const debounceMap: { [key: string]: ReturnType<typeof setTimeout> | null } = {};

export default function debounceWithKey<T extends (...args: unknown[]) => void>(
  key: string,
  func: T,
  wait: number
): T & { clear: () => void } {
  function debouncedFunction(this: unknown, ...args: Parameters<T>): void {
    const later = () => {
      debounceMap[key] = null;
      func.apply(this, args);
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

  return debouncedFunction as T & { clear: () => void };
}
