import { useRef, useSyncExternalStore } from "react";

const subscribeToNothing = () => () => {};

/**
 * Reads a value that only exists in the browser (localStorage, the user's time
 * zone, the current date) without a hydration mismatch and without setting
 * state from an effect.
 *
 * The prerendered markup uses `serverValue`; React then re-renders once on the
 * client with the result of `read`. The value is read a single time and cached
 * for the lifetime of the component.
 *
 * @param read - Reads the browser-only value. Called once, on the client.
 * @param serverValue - Placeholder rendered on the server and while hydrating
 * @returns The server placeholder, then the client value
 */
export function useClientValue<T>(read: () => T, serverValue: T): T {
  const cache = useRef<{ value: T } | null>(null);

  const getClientSnapshot = () => {
    cache.current ??= { value: read() };
    return cache.current.value;
  };

  return useSyncExternalStore(
    subscribeToNothing,
    getClientSnapshot,
    () => serverValue
  );
}
