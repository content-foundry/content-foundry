import { useCallback, useRef } from "react";

/**
 * Hook to debounce a function call
 * @param fn The function to debounce
 * @param delay Delay in milliseconds
 * @returns Debounced function
 */
// deno-lint-ignore no-explicit-any
export function useDebouncedFunction<T extends (...args: any[]) => any>(
  fn: T,
  delay: number,
): T {
  const timeoutRef = useRef<number | null>(null);

  const debouncedFn = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        globalThis.clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = globalThis.setTimeout(() => {
        fn(...args);
      }, delay);
    },
    [fn, delay],
  ) as T;

  return debouncedFn;
}
