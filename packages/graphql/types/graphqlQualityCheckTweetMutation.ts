import { mutationField, stringArg } from "nexus";
import {
  graphqlYCRecommendationsType,
} from "packages/graphql/types/graphqlRecommendation.ts";
import { runIt as runItYC } from "content/documentation/product/backlog/experimental/aiYC.ts";
import { getLogger } from "packages/logger.ts";

const logger = getLogger(import.meta);

export const submitYcFormMutation = mutationField("submitYcForm", {
  args: {
    formData: stringArg(),
    taskPrompt: stringArg(),
    systemPrompt: stringArg(),
  },
  type: graphqlYCRecommendationsType,
  resolve: async (_, { formData, taskPrompt, systemPrompt }, ctx) => {
    if (!formData) {
      throw new Error("No formData");
    }
    const recommendationsResponse = await runItYC(
      formData ?? "{}",
      taskPrompt ?? undefined,
      systemPrompt ?? undefined,
    );
    logger.debug("Response", recommendationsResponse);
    return recommendationsResponse;
  },
});
