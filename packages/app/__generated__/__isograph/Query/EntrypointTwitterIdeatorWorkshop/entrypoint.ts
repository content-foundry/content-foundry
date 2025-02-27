import type {IsographEntrypoint, NormalizationAst, RefetchQueryNormalizationArtifactWrapper} from '@isograph/react';
import {Query__EntrypointTwitterIdeatorWorkshop__param} from './param_type.ts';
import {Query__EntrypointTwitterIdeatorWorkshop__output_type} from './output_type.ts';
import readerResolver from './resolver_reader.ts';
const nestedRefetchQueries: RefetchQueryNormalizationArtifactWrapper[] = [];

const queryText = 'query EntrypointTwitterIdeatorWorkshop  {\
  me {\
    __typename,\
    id,\
    organization {\
      id,\
      __typename,\
      creation {\
        originalText,\
        suggestions {\
          explanation,\
          tweet,\
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
                  kind: "Scalar",
                  fieldName: "originalText",
                  arguments: null,
                },
                {
                  kind: "Linked",
                  fieldName: "suggestions",
                  arguments: null,
                  concreteType: "Suggestion",
                  selections: [
                    {
                      kind: "Scalar",
                      fieldName: "explanation",
                      arguments: null,
                    },
                    {
                      kind: "Scalar",
                      fieldName: "tweet",
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
  Query__EntrypointTwitterIdeatorWorkshop__param,
  Query__EntrypointTwitterIdeatorWorkshop__output_type,
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
