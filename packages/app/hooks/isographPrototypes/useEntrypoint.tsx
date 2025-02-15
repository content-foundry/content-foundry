import { useMutation } from "packages/app/hooks/isographPrototypes/useMutation.tsx";
import type { IsographEntrypoint } from "@isograph/react";

// deno-lint-ignore no-explicit-any
export function useEntrypoint<T extends IsographEntrypoint<any, any>>(
  entrypoint: T,
) {
  const { commit, responseElement } = useMutation(entrypoint);
  return {
    load: commit,
    responseElement,
  };
}
