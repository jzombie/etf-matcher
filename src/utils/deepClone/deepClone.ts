function deepClone<T>(obj: T, seen = new WeakMap()): T {
  if (typeof obj === "function") {
    throw new Error("Function cloning is not supported.");
  }

  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  if (seen.has(obj)) {
    return seen.get(obj);
  }

  let clone: any;

  if (Array.isArray(obj)) {
    clone = [];
    seen.set(obj, clone);
    obj.forEach((item, index) => {
      clone[index] = deepClone(item, seen);
    });
  } else if (obj instanceof Date) {
    clone = new Date(obj);
  } else {
    clone = {};
    seen.set(obj, clone);
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clone[key] = deepClone((obj as any)[key], seen);
      }
    }
  }

  return clone as T;
}

export default deepClone;
