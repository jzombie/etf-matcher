import init, { count_etfs_per_exchange } from "./pkg/hello_wasm.js";

self.onmessage = async (event) => {
  const dataUrl = event.data;
  try {
    await init();
    const counts = await count_etfs_per_exchange(dataUrl);
    self.postMessage({ success: true, counts });
  } catch (error) {
    self.postMessage({ success: false, error: error.message });
  }
};

self.onerror = (error) => {
  console.error("Worker error:", error);
  self.postMessage({ success: false, error: error.message });
};
