/**
 * Performs a deep comparison between two objects to determine whether they
 * are deeply equal.
 *
 * This method avoids recursion by using an explicit stack to manage the
 * comparison process and a WeakMap to handle cyclic references.
 */
export default function deepEqual<T1, T2>(obj1: T1, obj2: T2): boolean {
  const stack: Array<{ prev: any; next: any }> = [{ prev: obj1, next: obj2 }];
  const visited = new WeakMap<any, any>();

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
    if (visited.has(prev)) {
      if (visited.get(prev) === next) {
        continue;
      } else {
        return false;
      }
    }
    visited.set(prev, next);

    if (prev instanceof Date && next instanceof Date) {
      if (prev.getTime() !== next.getTime()) {
        return false;
      }
      continue;
    }

    const prevKeys = Object.keys(prev);
    const nextKeys = Object.keys(next);

    if (prevKeys.length !== nextKeys.length) {
      return false;
    }

    for (const key of prevKeys) {
      if (!nextKeys.includes(key)) {
        return false;
      }
      stack.push({ prev: prev[key], next: next[key] });
    }
  }

  return true;
}
