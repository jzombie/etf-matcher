import { useEffect, useState } from "react";

import msgpack from "msgpack-lite";

import customLogger from "@utils/customLogger";

export default function useObjectHash(
  obj?: Record<string, unknown> | Record<string, unknown>[] | null,
): string {
  const [hash, setHash] = useState<string>("");

  useEffect(() => {
    // Serialize the object into a binary format
    const binaryData = msgpack.encode(obj);

    // Generate the hash and update the state
    generateHash(binaryData).then(setHash);
  }, [obj]);

  return hash;
}

async function generateHash(data: Uint8Array): Promise<string> {
  if (typeof crypto !== "undefined" && crypto.subtle && crypto.subtle.digest) {
    // Use Web Crypto API if available
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((byte) => byte.toString(16).padStart(2, "0")).join("");
  } else {
    // Fallback to FNV-1a hash if Web Crypto API is unavailable
    customLogger.warn(
      "Web Crypto API not available. Using FNV-1a hash as a fallback.",
    );
    return fnv1aHash(data);
  }
}

// FNV-1a hash function for fallback
function fnv1aHash(data: Uint8Array): string {
  let hash = 2166136261;
  for (let i = 0; i < data.length; i++) {
    hash ^= data[i];
    hash +=
      (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  // Convert to hexadecimal string
  return (hash >>> 0).toString(16).padStart(8, "0");
}
