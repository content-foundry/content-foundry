import { useMutation } from "packages/app/hooks/isographPrototypes/useMutation.tsx";
import type { BfIsographEntrypoint } from "lib/BfIsographEntrypoint.ts";

export function useEntrypoint<T extends BfIsographEntrypoint>(
  entrypoint: T,
) {
  const { commit, responseElement } = useMutation(entrypoint);
  return {
    load: commit,
    responseElement,
  };
}
