import type {IsographEntrypoint, NormalizationAst, RefetchQueryNormalizationArtifactWrapper} from '@isograph/react';
import {Query__entrypointFormatterEditor__param} from './param_type.ts';
import {Query__entrypointFormatterEditor__output_type} from './output_type.ts';
import readerResolver from './resolver_reader.ts';
const nestedRefetchQueries: RefetchQueryNormalizationArtifactWrapper[] = [];

const queryText = 'query entrypointFormatterEditor  {\
  me {\
    __typename,\
    id,\
    organization {\
      id,\
      __typename,\
      creation {\
        revisions {\
          explanation,\
          original,\
          revision,\
          revisionTitle,\
        },\
      },\
      identity {\
        twitter {\
          handle,\
          imgUrl,\
          name,\
        },\
        voice {\
          voice,\
          voiceSummary,\
        },\
      },\
    },\
  },\
}';

const normalizationAst: NormalizationAst = {
  kind: "NormalizationAst",
  selections: [
    {
      kind: "Linked",
      fieldName: "me",
      arguments: null,
      concreteType: null,
      selections: [
        {
          kind: "Scalar",
          fieldName: "__typename",
          arguments: null,
        },
        {
          kind: "Scalar",
          fieldName: "id",
          arguments: null,
        },
        {
          kind: "Linked",
          fieldName: "organization",
          arguments: null,
          concreteType: "BfOrganization",
          selections: [
            {
              kind: "Scalar",
              fieldName: "id",
              arguments: null,
            },
            {
              kind: "Scalar",
              fieldName: "__typename",
              arguments: null,
            },
            {
              kind: "Linked",
              fieldName: "creation",
              arguments: null,
              concreteType: "Creation",
              selections: [
                {
                  kind: "Linked",
                  fieldName: "revisions",
                  arguments: null,
                  concreteType: "Revisions",
                  selections: [
                    {
                      kind: "Scalar",
                      fieldName: "explanation",
                      arguments: null,
                    },
                    {
                      kind: "Scalar",
                      fieldName: "original",
                      arguments: null,
                    },
                    {
                      kind: "Scalar",
                      fieldName: "revision",
                      arguments: null,
                    },
                    {
                      kind: "Scalar",
                      fieldName: "revisionTitle",
                      arguments: null,
                    },
                  ],
                },
              ],
            },
            {
              kind: "Linked",
              fieldName: "identity",
              arguments: null,
              concreteType: "BfOrganization_Identity",
              selections: [
                {
                  kind: "Linked",
                  fieldName: "twitter",
                  arguments: null,
                  concreteType: "Twitter",
                  selections: [
                    {
                      kind: "Scalar",
                      fieldName: "handle",
                      arguments: null,
                    },
                    {
                      kind: "Scalar",
                      fieldName: "imgUrl",
                      arguments: null,
                    },
                    {
                      kind: "Scalar",
                      fieldName: "name",
                      arguments: null,
                    },
                  ],
                },
                {
                  kind: "Linked",
                  fieldName: "voice",
                  arguments: null,
                  concreteType: "Voice",
                  selections: [
                    {
                      kind: "Scalar",
                      fieldName: "voice",
                      arguments: null,
                    },
                    {
                      kind: "Scalar",
                      fieldName: "voiceSummary",
                      arguments: null,
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
const artifact: IsographEntrypoint<
  Query__entrypointFormatterEditor__param,
  Query__entrypointFormatterEditor__output_type,
  NormalizationAst
> = {
  kind: "Entrypoint",
  networkRequestInfo: {
    kind: "NetworkRequestInfo",
    queryText,
    normalizationAst,
  },
  concreteType: "Query",
  readerWithRefetchQueries: {
    kind: "ReaderWithRefetchQueries",
    nestedRefetchQueries,
    readerArtifact: readerResolver,
  },
};

export default artifact;
