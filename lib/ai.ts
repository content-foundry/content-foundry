import OpenAI from "@openai/openai";
import { getConfigurationVariable } from "packages/getConfigurationVariable.ts";
import { getLogger } from "packages/logger.ts";

const logger = getLogger(import.meta);

// Store instances rather than creating them each time
let openRouter: OpenAI | null = null;
let openAI: OpenAI | null = null;

// Mock client that logs errors instead of making actual API calls
class MockAIClient {
  private static instance: MockAIClient | null = null;

  private constructor() {
    logger.warn("Using mock AI client - all API calls will fail gracefully");
  }

  static getInstance() {
    if (!MockAIClient.instance) {
      MockAIClient.instance = new MockAIClient();
    }
    return MockAIClient.instance;
  }

  // Create a proxy that catches all method calls
  static createProxy() {
    const handler = {
      get(_: unknown, prop: string) {
        // If it's a method like chat.completions.create
        if (typeof prop === "string") {
          // Return a function that handles nested properties
          return new Proxy(() => {}, {
            get(_, _p) {
              // Handle deeper nesting (e.g., chat.completions.create)
              return new Proxy(() => {}, {
                apply: function () {
                  logger.error(
                    "AI API call attempted but no API keys are configured",
                  );
                  return Promise.reject(new Error("No AI API keys configured"));
                },
              });
            },
            // Handle direct calls (e.g., completions.create)
            apply: function () {
              logger.error(
                "AI API call attempted but no API keys are configured",
              );
              return Promise.reject(new Error("No AI API keys configured"));
            },
          });
        }
        return undefined;
      },
    };

    return new Proxy(MockAIClient.getInstance(), handler);
  }
}

export function getAi(forceOpenAI = false): OpenAI {
  // Try OpenAI if explicitly requested or if we need to fallback
  const tryInitializeOpenAI = () => {
    if (!openAI) {
      const openAiApiKey = getConfigurationVariable("OPENAI_API_KEY");
      if (!openAiApiKey) {
        logger.warn("OPENAI_API_KEY is not set");
        return null; // Return null to indicate failure
      }

      openAI = new OpenAI({
        apiKey: openAiApiKey,
      });
      logger.debug("OpenAI client initialized");
    }
    return openAI;
  };

  // If OpenAI was explicitly requested, try to use it
  if (forceOpenAI) {
    const client = tryInitializeOpenAI();
    if (client) return client;

    // If we get here, we couldn't initialize OpenAI despite being forced
    return MockAIClient.createProxy() as OpenAI;
  }

  // Try to use OpenRouter first
  if (!openRouter) {
    const apiKey = getConfigurationVariable("OPEN_ROUTER_API_KEY");
    if (!apiKey) {
      logger.warn("OPEN_ROUTER_API_KEY is not set, falling back to OpenAI");

      // Try OpenAI as fallback
      const openAiClient = tryInitializeOpenAI();
      if (openAiClient) return openAiClient;

      // Both OpenRouter and OpenAI initialization failed
      logger.error("Neither OPEN_ROUTER_API_KEY nor OPENAI_API_KEY is set");
      return MockAIClient.createProxy() as OpenAI;
    }

    openRouter = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey,
    });
    logger.debug("OpenRouter client initialized");
  }

  return openRouter;
}
