import init, { count_entries_per_exchange } from "./pkg/hello_wasm.js";

self.onmessage = async (event) => {
  const { url, password } = event.data;
  console.log(
    "Worker received message with URL:",
    url,
    "and password:",
    password
  );
  try {
    await init();
    const counts = await count_entries_per_exchange(url, password);
    console.log("Worker successfully fetched and counted entries:", counts);
    self.postMessage({ success: true, counts: counts });
  } catch (error) {
    console.error("Worker encountered an error:", error);
    self.postMessage({ success: false, error: error.message });
  }
};
