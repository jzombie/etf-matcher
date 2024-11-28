export default function getIsClipboardAvailable() {
  return Boolean(navigator.clipboard && navigator.clipboard.writeText);
}
