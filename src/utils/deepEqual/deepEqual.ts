/**
 * Performs a deep comparison between two objects to determine
 * whether they are deeply equal. This method avoids recursion
 * by using an explicit stack to manage the comparison process.
 */
export default function deepEqual<T1, T2>(obj1: T1, obj2: T2): boolean {
  // Use a stack to avoid recursion
  const stack: Array<{ prev: any; next: any }> = [{ prev: obj1, next: obj2 }];

  while (stack.length > 0) {
    const { prev, next } = stack.pop()!;

    // Handle primitive types and strict equality
    if (prev === next) continue;

    // If either is not an object or is null, they are not equal
    if (
      typeof prev !== "object" ||
      typeof next !== "object" ||
      prev === null ||
      next === null
    ) {
      return false;
    }

    // Special case for Date objects
    if (prev instanceof Date && next instanceof Date) {
      if (prev.getTime() !== next.getTime()) {
        return false;
      } else {
        continue;
      }
    }

    const prevKeys = Object.keys(prev);
    const nextKeys = Object.keys(next);

    // Different number of keys means objects are not equal
    if (prevKeys.length !== nextKeys.length) {
      return false;
    }

    for (const key of prevKeys) {
      if (!nextKeys.includes(key)) {
        return false;
      }

      // Push objects to the stack for further comparison
      stack.push({ prev: prev[key], next: next[key] });
    }
  }

  return true;
}
