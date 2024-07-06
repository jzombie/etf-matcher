export default function deepFreeze<T extends object>(obj: T): T {
  Object.freeze(obj);

  Object.keys(obj).forEach((key) => {
    const prop = (obj as any)[key];
    if (prop && typeof prop === "object" && !Object.isFrozen(prop)) {
      deepFreeze(prop);
    }
  });

  return obj;
}
