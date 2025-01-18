type DeepMerge<T, S> = {
  [K in keyof T | keyof S]: K extends keyof S
    ? K extends keyof T
      ? T[K] extends Record<string, unknown>
        ? S[K] extends Record<string, unknown>
          ? DeepMerge<T[K], S[K]> // Recursively merge nested objects
          : S[K]
        : S[K]
      : S[K]
    : K extends keyof T
      ? T[K]
      : never;
};

/**
 * Recursively merges the `source` object into the `target` object.
 *
 * - **Modifies in Place:** This function modifies the `target` object in place.
 * - **Priority:** Properties from the `source` object overwrite those in the `target` object.
 *
 * @template T - The type of the target object.
 * @template S - The type of the source object.
 * @param target - The object to be updated with values from `source`.
 * @param source - The object whose properties will be merged into `target`.
 * @returns The merged object.
 */
export default function deepMerge<
  T extends Record<string, unknown>,
  S extends Record<string, unknown>,
>(target: T, source: S): DeepMerge<T, S> {
  // Ensure source is a valid object
  if (typeof source !== "object" || source === null) {
    return source as DeepMerge<T, S>;
  }

  // Ensure target is a valid object
  if (typeof target !== "object" || target === null) {
    return { ...source } as DeepMerge<T, S>;
  }

  for (const key of Object.keys(source) as (keyof S)[]) {
    if (
      typeof source[key] === "object" &&
      source[key] !== null &&
      !Array.isArray(source[key])
    ) {
      if (
        typeof target[key as keyof T] !== "object" ||
        target[key as keyof T] === null ||
        Array.isArray(target[key as keyof T])
      ) {
        target[key as keyof T] = {} as T[keyof T];
      }

      // Recursively merge nested objects
      deepMerge(
        target[key as keyof T] as Record<string, unknown>,
        source[key as keyof S] as Record<string, unknown>,
      );
    } else {
      // Assign the value from source to target
      (target[key as keyof T] as unknown) = source[key as keyof S];
    }
  }

  return target as DeepMerge<T, S>;
}
