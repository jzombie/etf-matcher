/**
 * A utility function to explicitly consume a prop without performing any operation.
 *
 * This is useful for ensuring that a prop is marked as "used" in scenarios where
 * it is required to be part of a dependency array in `useEffect` or similar hooks,
 * but does not directly contribute to the logic.
 *
 * Example:
 * ```tsx
 * import consumeProp from './consumeProp';
 *
 * useEffect(() => {
 *   consumeProp(appThemeProps); // Ensures `appThemeProps` is explicitly consumed
 *
 *   // Your effect logic here...
 * }, [appThemeProps]);
 * ```
 *
 * - **Purpose:** Prevents ESLint or TypeScript warnings/errors about unused variables.
 * - **Runtime Impact:** None, as the `void` operator discards the result of `prop`.
 *
 * @template T - The type of the prop being consumed.
 * @param {T} prop - The prop to be consumed.
 */
export default function consumeProp<T>(prop: T): void {
  // This function ensures the prop is consumed without doing anything
  void prop;
}
