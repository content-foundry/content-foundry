import type {IsographEntrypoint, NormalizationAst, RefetchQueryNormalizationArtifactWrapper} from '@isograph/react';
import {Query__entrypointTwitterIdeatorResearch__param} from './param_type.ts';
import {Query__entrypointTwitterIdeatorResearch__output_type} from './output_type.ts';
import readerResolver from './resolver_reader.ts';
const nestedRefetchQueries: RefetchQueryNormalizationArtifactWrapper[] = [];

const queryText = 'query entrypointTwitterIdeatorResearch  {\
  me {\
    __typename,\
    id,\
    organization {\
      id,\
      __typename,\
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
      research {\
        __typename,\
        topics {\
          entries {\
            name,\
            summary,\
            type,\
            url,\
          },\
          name,\
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
            {
              kind: "Linked",
              fieldName: "research",
              arguments: null,
              concreteType: "BfOrganization_Research",
              selections: [
                {
                  kind: "Scalar",
                  fieldName: "__typename",
                  arguments: null,
                },
                {
                  kind: "Linked",
                  fieldName: "topics",
                  arguments: null,
                  concreteType: "ResearchTopic",
                  selections: [
                    {
                      kind: "Linked",
                      fieldName: "entries",
                      arguments: null,
                      concreteType: "ResearchEntry",
                      selections: [
                        {
                          kind: "Scalar",
                          fieldName: "name",
                          arguments: null,
                        },
                        {
                          kind: "Scalar",
                          fieldName: "summary",
                          arguments: null,
                        },
                        {
                          kind: "Scalar",
                          fieldName: "type",
                          arguments: null,
                        },
                        {
                          kind: "Scalar",
                          fieldName: "url",
                          arguments: null,
                        },
                      ],
                    },
                    {
                      kind: "Scalar",
                      fieldName: "name",
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
  Query__entrypointTwitterIdeatorResearch__param,
  Query__entrypointTwitterIdeatorResearch__output_type,
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
