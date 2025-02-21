import OpenAI from "@openai/openai";
import { getConfigurationVariable } from "packages/getConfigurationVariable.ts";
import { getLogger } from "packages/logger.ts";

const _logger = getLogger(import.meta);

let openRouter: OpenAI;
let openAI: OpenAI;
export function getAi(forceOpenAI = false): OpenAI {
  if (forceOpenAI) {
    if (openAI) {
      return openAI;
    }
    const openAiApiKey = getConfigurationVariable("OPENAI_API_KEY");
    if (!openAiApiKey) throw new Error("OPENAI_API_KEY is not set");
    openAI = new OpenAI({
      apiKey: openAiApiKey,
    });
    return openAI;
  }

  if (openRouter) {
    return openRouter;
  }

  const apiKey = getConfigurationVariable("OPEN_ROUTER_API_KEY");
  if (!apiKey) throw new Error("OPEN_ROUTER_API_KEY is not set");

  openRouter = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey,
  });
  return openRouter;
}
