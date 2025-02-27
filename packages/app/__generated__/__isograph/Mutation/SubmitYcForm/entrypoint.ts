import type {IsographEntrypoint, NormalizationAst, RefetchQueryNormalizationArtifactWrapper} from '@isograph/react';
import {Mutation__SubmitYcForm__param} from './param_type.ts';
import {Mutation__SubmitYcForm__output_type} from './output_type.ts';
import readerResolver from './resolver_reader.ts';
const nestedRefetchQueries: RefetchQueryNormalizationArtifactWrapper[] = [];

const queryText = 'mutation SubmitYcForm ($formData: String!) {\
  submitYcForm____formData___v_formData: submitYcForm(formData: $formData) {\
    __typename,\
    companySummary {\
      confidence,\
      explanation,\
      revision,\
    },\
    competitors {\
      confidence,\
      explanation,\
      revision,\
    },\
    equityBreakdown {\
      confidence,\
      explanation,\
      revision,\
    },\
    investmentsReceived {\
      confidence,\
      explanation,\
      revision,\
    },\
    locationDecision {\
      confidence,\
      explanation,\
      revision,\
    },\
    moneyMaking {\
      confidence,\
      explanation,\
      revision,\
    },\
    otherIdeas {\
      confidence,\
      explanation,\
      revision,\
    },\
    otherIncubators {\
      confidence,\
      explanation,\
      revision,\
    },\
    previousApplicationChange {\
      confidence,\
      explanation,\
      revision,\
    },\
    productSummary {\
      confidence,\
      explanation,\
      revision,\
    },\
    progress {\
      confidence,\
      explanation,\
      revision,\
    },\
    reasonForApplying {\
      confidence,\
      explanation,\
      revision,\
    },\
    reasonForProductChoice {\
      confidence,\
      explanation,\
      revision,\
    },\
    revenueSource {\
      confidence,\
      explanation,\
      revision,\
    },\
    techStack {\
      confidence,\
      explanation,\
      revision,\
    },\
    whoToldYou {\
      confidence,\
      explanation,\
      revision,\
    },\
    workLengthHistory {\
      confidence,\
      explanation,\
      revision,\
    },\
  },\
}';

const normalizationAst: NormalizationAst = {
  kind: "NormalizationAst",
  selections: [
    {
      kind: "Linked",
      fieldName: "submitYcForm",
      arguments: [
        [
          "formData",
          { kind: "Variable", name: "formData" },
        ],
      ],
      concreteType: "YCRecommendations",
      selections: [
        {
          kind: "Scalar",
          fieldName: "__typename",
          arguments: null,
        },
        {
          kind: "Linked",
          fieldName: "companySummary",
          arguments: null,
          concreteType: "YCRecommendationItem",
          selections: [
            {
              kind: "Scalar",
              fieldName: "confidence",
              arguments: null,
            },
            {
              kind: "Scalar",
              fieldName: "explanation",
              arguments: null,
            },
            {
              kind: "Scalar",
              fieldName: "revision",
              arguments: null,
            },
          ],
        },
        {
          kind: "Linked",
          fieldName: "competitors",
          arguments: null,
          concreteType: "YCRecommendationItem",
          selections: [
            {
              kind: "Scalar",
              fieldName: "confidence",
              arguments: null,
            },
            {
              kind: "Scalar",
              fieldName: "explanation",
              arguments: null,
            },
            {
              kind: "Scalar",
              fieldName: "revision",
              arguments: null,
            },
          ],
        },
        {
          kind: "Linked",
          fieldName: "equityBreakdown",
          arguments: null,
          concreteType: "YCRecommendationItem",
          selections: [
            {
              kind: "Scalar",
              fieldName: "confidence",
              arguments: null,
            },
            {
              kind: "Scalar",
              fieldName: "explanation",
              arguments: null,
            },
            {
              kind: "Scalar",
              fieldName: "revision",
              arguments: null,
            },
          ],
        },
        {
          kind: "Linked",
          fieldName: "investmentsReceived",
          arguments: null,
          concreteType: "YCRecommendationItem",
          selections: [
            {
              kind: "Scalar",
              fieldName: "confidence",
              arguments: null,
            },
            {
              kind: "Scalar",
              fieldName: "explanation",
              arguments: null,
            },
            {
              kind: "Scalar",
              fieldName: "revision",
              arguments: null,
            },
          ],
        },
        {
          kind: "Linked",
          fieldName: "locationDecision",
          arguments: null,
          concreteType: "YCRecommendationItem",
          selections: [
            {
              kind: "Scalar",
              fieldName: "confidence",
              arguments: null,
            },
            {
              kind: "Scalar",
              fieldName: "explanation",
              arguments: null,
            },
            {
              kind: "Scalar",
              fieldName: "revision",
              arguments: null,
            },
          ],
        },
        {
          kind: "Linked",
          fieldName: "moneyMaking",
          arguments: null,
          concreteType: "YCRecommendationItem",
          selections: [
            {
              kind: "Scalar",
              fieldName: "confidence",
              arguments: null,
            },
            {
              kind: "Scalar",
              fieldName: "explanation",
              arguments: null,
            },
            {
              kind: "Scalar",
              fieldName: "revision",
              arguments: null,
            },
          ],
        },
        {
          kind: "Linked",
          fieldName: "otherIdeas",
          arguments: null,
          concreteType: "YCRecommendationItem",
          selections: [
            {
              kind: "Scalar",
              fieldName: "confidence",
              arguments: null,
            },
            {
              kind: "Scalar",
              fieldName: "explanation",
              arguments: null,
            },
            {
              kind: "Scalar",
              fieldName: "revision",
              arguments: null,
            },
          ],
        },
        {
          kind: "Linked",
          fieldName: "otherIncubators",
          arguments: null,
          concreteType: "YCRecommendationItem",
          selections: [
            {
              kind: "Scalar",
              fieldName: "confidence",
              arguments: null,
            },
            {
              kind: "Scalar",
              fieldName: "explanation",
              arguments: null,
            },
            {
              kind: "Scalar",
              fieldName: "revision",
              arguments: null,
            },
          ],
        },
        {
          kind: "Linked",
          fieldName: "previousApplicationChange",
          arguments: null,
          concreteType: "YCRecommendationItem",
          selections: [
            {
              kind: "Scalar",
              fieldName: "confidence",
              arguments: null,
            },
            {
              kind: "Scalar",
              fieldName: "explanation",
              arguments: null,
            },
            {
              kind: "Scalar",
              fieldName: "revision",
              arguments: null,
            },
          ],
        },
        {
          kind: "Linked",
          fieldName: "productSummary",
          arguments: null,
          concreteType: "YCRecommendationItem",
          selections: [
            {
              kind: "Scalar",
              fieldName: "confidence",
              arguments: null,
            },
            {
              kind: "Scalar",
              fieldName: "explanation",
              arguments: null,
            },
            {
              kind: "Scalar",
              fieldName: "revision",
              arguments: null,
            },
          ],
        },
        {
          kind: "Linked",
          fieldName: "progress",
          arguments: null,
          concreteType: "YCRecommendationItem",
          selections: [
            {
              kind: "Scalar",
              fieldName: "confidence",
              arguments: null,
            },
            {
              kind: "Scalar",
              fieldName: "explanation",
              arguments: null,
            },
            {
              kind: "Scalar",
              fieldName: "revision",
              arguments: null,
            },
          ],
        },
        {
          kind: "Linked",
          fieldName: "reasonForApplying",
          arguments: null,
          concreteType: "YCRecommendationItem",
          selections: [
            {
              kind: "Scalar",
              fieldName: "confidence",
              arguments: null,
            },
            {
              kind: "Scalar",
              fieldName: "explanation",
              arguments: null,
            },
            {
              kind: "Scalar",
              fieldName: "revision",
              arguments: null,
            },
          ],
        },
        {
          kind: "Linked",
          fieldName: "reasonForProductChoice",
          arguments: null,
          concreteType: "YCRecommendationItem",
          selections: [
            {
              kind: "Scalar",
              fieldName: "confidence",
              arguments: null,
            },
            {
              kind: "Scalar",
              fieldName: "explanation",
              arguments: null,
            },
            {
              kind: "Scalar",
              fieldName: "revision",
              arguments: null,
            },
          ],
        },
        {
          kind: "Linked",
          fieldName: "revenueSource",
          arguments: null,
          concreteType: "YCRecommendationItem",
          selections: [
            {
              kind: "Scalar",
              fieldName: "confidence",
              arguments: null,
            },
            {
              kind: "Scalar",
              fieldName: "explanation",
              arguments: null,
            },
            {
              kind: "Scalar",
              fieldName: "revision",
              arguments: null,
            },
          ],
        },
        {
          kind: "Linked",
          fieldName: "techStack",
          arguments: null,
          concreteType: "YCRecommendationItem",
          selections: [
            {
              kind: "Scalar",
              fieldName: "confidence",
              arguments: null,
            },
            {
              kind: "Scalar",
              fieldName: "explanation",
              arguments: null,
            },
            {
              kind: "Scalar",
              fieldName: "revision",
              arguments: null,
            },
          ],
        },
        {
          kind: "Linked",
          fieldName: "whoToldYou",
          arguments: null,
          concreteType: "YCRecommendationItem",
          selections: [
            {
              kind: "Scalar",
              fieldName: "confidence",
              arguments: null,
            },
            {
              kind: "Scalar",
              fieldName: "explanation",
              arguments: null,
            },
            {
              kind: "Scalar",
              fieldName: "revision",
              arguments: null,
            },
          ],
        },
        {
          kind: "Linked",
          fieldName: "workLengthHistory",
          arguments: null,
          concreteType: "YCRecommendationItem",
          selections: [
            {
              kind: "Scalar",
              fieldName: "confidence",
              arguments: null,
            },
            {
              kind: "Scalar",
              fieldName: "explanation",
              arguments: null,
            },
            {
              kind: "Scalar",
              fieldName: "revision",
              arguments: null,
            },
          ],
        },
      ],
    },
  ],
};
const artifact: IsographEntrypoint<
  Mutation__SubmitYcForm__param,
  Mutation__SubmitYcForm__output_type,
  NormalizationAst
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
