import {
  FragmentReader,
  type IsographEntrypoint,
  useImperativeReference,
} from "@isograph/react";

// deno-lint-ignore no-explicit-any
export function useMutation<T extends IsographEntrypoint<any, any>>(
  mutation: T,
) {
  const {
    fragmentReference: mutationRef,
    loadFragmentReference: commit,
  } = useImperativeReference(mutation);
  const returnable = {
    responseElement: null as React.ReactNode,
    commit,
  };
  if (mutationRef) {
    returnable.responseElement = (
      <FragmentReader fragmentReference={mutationRef} additionalProps={{}} />
    );
  }

  return returnable;
}
