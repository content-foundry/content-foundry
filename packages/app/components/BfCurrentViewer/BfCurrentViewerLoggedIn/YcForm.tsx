import React, { useState } from "react";
import { iso } from "packages/app/__generated__/__isograph/iso.ts";
import { BfDsForm } from "packages/bfDs/components/BfDsForm/BfDsForm.tsx";
import { BfDsFormTextArea } from "packages/bfDs/components/BfDsForm/BfDsFormTextArea.tsx";
import { getLogger } from "packages/logger.ts";
import { BfDsFormSubmitButton } from "packages/bfDs/components/BfDsForm/BfDsFormSubmitButton.tsx";
import { useMutation } from "packages/app/hooks/isographPrototypes/useMutation.tsx";
import ycFormSubmitMutation from "packages/app/__generated__/__isograph/Mutation/SubmitYcForm/entrypoint.ts";
import { Revision } from "packages/app/components/ContentOS/Revision.tsx";

const logger = getLogger(import.meta);

type Revisions = Record<string, {
  revision: string;
  explanation: string;
  confidence: number;
}>;

const formFields = [
  { id: "companySummary", title: "Company Summary" },
  { id: "productSummary", title: "Product Summary" },
  { id: "locationDecision", title: "Location Decision" },
  { id: "progress", title: "Progress" },
  { id: "workLengthHistory", title: "Work Length History" },
  { id: "techStack", title: "Tech Stack" },
  { id: "revenueSource", title: "Revenue Source" },
  { id: "previousApplicationChange", title: "Previous Application Change" },
  { id: "otherIncubators", title: "Other Incubators" },
  { id: "reasonForProductChoice", title: "Reason For Product Choice" },
  { id: "competitors", title: "Competitors" },
  { id: "moneyMaking", title: "Money Making" },
  { id: "otherIdeas", title: "Other Ideas" },
  { id: "equityBreakdown", title: "Equity Breakdown" },
  { id: "investmentsReceived", title: "Investments Received" },
  { id: "reasonForApplying", title: "Reason For Applying" },
  { id: "whoToldYou", title: "Who Told You" },
];

const initialData = {
  companySummary: "",
  productSummary: "",
  locationDecision: "",
  progress: "",
  workLengthHistory: "",
  techStack: "",
  revenueSource: "",
  previousApplicationChange: "",
  otherIncubators: "",
  reasonForProductChoice: "",
  competitors: "",
  moneyMaking: "",
  otherIdeas: "",
  equityBreakdown: "",
  investmentsReceived: "",
  reasonForApplying: "",
  whoToldYou: "",
};

export const YcForm = iso(`
  field BfCurrentViewerLoggedIn.YcForm @component {
    __typename
  }
`)(function YcForm() {
  const { commit } = useMutation(ycFormSubmitMutation);
  const [revisions, setRevisions] = useState<Revisions>({});
  const [submitted, setSubmitted] = useState(false);
  const hasRevisions = Object.keys(revisions).length > 0;

  logger.debug("hasRevisions", hasRevisions, revisions);
  return (
    <BfDsForm
      initialData={initialData}
      onSubmit={(form) => {
        setSubmitted(true),
          commit({
            formData: JSON.stringify(form),
          }, {
            onComplete: (fromMutationData) => {
              logger.debug("YcForm submit successful", fromMutationData);
              setSubmitted(false);
              setRevisions(fromMutationData.submitYcForm ?? {});
            },
          });
      }}
      xstyle={{ width: "100%", maxWidth: "40rem", margin: "auto" }}
    >
      {formFields.map((field) => {
        return (
          <React.Fragment key={field.id}>
            <BfDsFormTextArea title={field.title} id={field.id} />
            {hasRevisions && (
              <Revision
                id={field.id}
                revision={revisions[field.id]?.revision}
                explanation={revisions[field.id]?.explanation}
                confidence={revisions[field.id]?.confidence}
              />
            )}
          </React.Fragment>
        );
      })}

      <BfDsFormSubmitButton text="Submit" showSpinner={submitted} />
    </BfDsForm>
  );
});
