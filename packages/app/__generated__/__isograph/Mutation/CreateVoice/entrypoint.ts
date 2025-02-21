import type {IsographEntrypoint, NormalizationAst, RefetchQueryNormalizationArtifactWrapper} from '@isograph/react';
import {Mutation__CreateVoice__param} from './param_type.ts';
import {Mutation__CreateVoice__output_type} from './output_type.ts';
import readerResolver from './resolver_reader.ts';
const nestedRefetchQueries: RefetchQueryNormalizationArtifactWrapper[] = [];

const queryText = 'mutation CreateVoice ($handle: String!) {\
  createVoice____handle___v_handle: createVoice(handle: $handle) {\
    __typename,\
  },\
}';

const normalizationAst: NormalizationAst = {
  kind: "NormalizationAst",
  selections: [
    {
      kind: "Linked",
      fieldName: "createVoice",
      arguments: [
        [
          "handle",
          { kind: "Variable", name: "handle" },
        ],
      ],
      concreteType: "Voice",
      selections: [
        {
          kind: "Scalar",
          fieldName: "__typename",
          arguments: null,
        },
      ],
    },
  ],
};
const artifact: IsographEntrypoint<
  Mutation__CreateVoice__param,
  Mutation__CreateVoice__output_type
> = {
  kind: "Entrypoint",
  networkRequestInfo: {
    kind: "NetworkRequestInfo",
    queryText,
    normalizationAst,
  },
  concreteType: "Mutation",
  readerWithRefetchQueries: {
    kind: "ReaderWithRefetchQueries",
    nestedRefetchQueries,
    readerArtifact: readerResolver,
  },
};

export default artifact;
