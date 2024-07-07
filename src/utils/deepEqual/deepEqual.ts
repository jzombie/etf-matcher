/**
 * Performs a deep comparison between two objects to determine whether they
 * are deeply equal.
 *
 * This method avoids recursion by using an explicit stack to manage the
 * comparison process and a WeakMap to handle cyclic references.
 */
export default function deepEqual<T1, T2>(obj1: T1, obj2: T2): boolean {
  const stack: Array<{ prev: unknown; next: unknown }> = [
    { prev: obj1, next: obj2 },
  ];
  const visited = new WeakMap<object, object>();

  while (stack.length > 0) {
    const { prev, next } = stack.pop()!;

    if (prev === next) continue;

    if (
      typeof prev !== "object" ||
      typeof next !== "object" ||
      prev === null ||
      next === null
    ) {
      return false;
    }

    // Check for cyclic references
    if (visited.has(prev as object)) {
      if (visited.get(prev as object) === next) {
        continue;
      } else {
        return false;
      }
    }
    visited.set(prev as object, next as object);

    if (prev instanceof Date && next instanceof Date) {
      if (prev.getTime() !== next.getTime()) {
        return false;
      }
      continue;
    }

    const prevKeys = Object.keys(prev as object);
    const nextKeys = Object.keys(next as object);

    if (prevKeys.length !== nextKeys.length) {
      return false;
    }

    for (const key of prevKeys) {
      if (!nextKeys.includes(key)) {
        return false;
      }
      stack.push({
        prev: (prev as Record<string, unknown>)[key],
        next: (next as Record<string, unknown>)[key],
      });
    }
  }

  return true;
}
