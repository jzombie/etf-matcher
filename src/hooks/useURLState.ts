// TODO: This hook is designed to fix an issue where querying for an exact symbol
// and immediately toggling `Toggle Exact Match` does not alter the state.
//
// It is designed to replace the convoluted `toggleExactMatch` and the `useEffect`
// above it in `SearchResults.tsx`, and anywhere else in the app that might need
// a suitable replacement.
//
// This essentially should act as helper for `react-router-dom` to intercept and
// build URL locations in a consistent manner.

// export default function useURLState() {
//
// }
