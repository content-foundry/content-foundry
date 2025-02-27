import {
  FragmentReader,
  type IsographEntrypoint,
  type NormalizationAst,
  useImperativeReference,
} from "@isograph/react";

export function useMutation<
  // deno-lint-ignore no-explicit-any
  T extends IsographEntrypoint<any, any, NormalizationAst>,
>(
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
