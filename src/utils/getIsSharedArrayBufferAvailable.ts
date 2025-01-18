export default function getIsSharedArrayBufferAvailable() {
  return (
    typeof SharedArrayBuffer !== "undefined" &&
    typeof Atomics !== "undefined" &&
    self.crossOriginIsolated === true
  );
}
