/**
 * Performs a deep clone of an object.
 *
 * This method avoids recursion by using an explicit stack to manage the
 * cloning process and a WeakMap to handle cyclic references.
 */
export default function deepClone<T extends object>(
  obj: T,
  seen = new WeakMap<object, object>()
): T {
  if (typeof obj === "function") {
    throw new Error("Function cloning is not supported.");
  }

  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  if (seen.has(obj)) {
    return seen.get(obj) as T;
  }

  let clone: T;

  if (Array.isArray(obj)) {
    clone = [] as unknown as T;
    seen.set(obj, clone);
    (obj as unknown as Array<unknown>).forEach((item, index) => {
      (clone as unknown as Array<unknown>)[index] = deepClone(
        item as object,
        seen
      );
    });
  } else if (obj instanceof Date) {
    clone = new Date(obj) as unknown as T;
  } else {
    clone = {} as T;
    seen.set(obj, clone);
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        (clone as unknown as Record<string, unknown>)[key] = deepClone(
          (obj as Record<string, unknown>)[key] as object,
          seen
        );
      }
    }
  }

  return clone;
}
