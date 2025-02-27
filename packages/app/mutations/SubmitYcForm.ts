import { iso } from "packages/app/__generated__/__isograph/iso.ts";
import { getLogger } from "packages/logger.ts";
const logger = getLogger(import.meta);

export const SubmitYcFormMutation = iso(`
  field Mutation.SubmitYcForm($formData: String!) {
    submitYcForm(formData: $formData){
      __typename
      companySummary {
        revision
        explanation
        confidence
      }
      productSummary {
        revision
        explanation
        confidence
      }
      locationDecision {
        revision
        explanation
        confidence
      }
      progress {
        revision
        explanation
        confidence
      }
      workLengthHistory {
        revision
        explanation
        confidence
      }
      techStack {
        revision
        explanation
        confidence
      }
      revenueSource {
        revision
        explanation
        confidence
      }
      previousApplicationChange {
        revision
        explanation
        confidence
      }
      otherIncubators {
        revision
        explanation
        confidence
      }
      reasonForProductChoice {
        revision
        explanation
        confidence
      }
      competitors {
        revision
        explanation
        confidence
      }
      moneyMaking {
        revision
        explanation
        confidence
      }
      otherIdeas {
        revision
        explanation
        confidence
      }
      equityBreakdown {
        revision
        explanation
        confidence
      }
      investmentsReceived {
        revision
        explanation
        confidence
      }
      reasonForApplying {
        revision
        explanation
        confidence
      }
      whoToldYou {
        revision
        explanation
        confidence
      }
    }
  }
`)(function SubmitYcForm({ data }) {
  logger.info("submitYcFormMutation", data);
  return data;
});
