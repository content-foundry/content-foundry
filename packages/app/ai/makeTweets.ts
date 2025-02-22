import { getAi } from "lib/ai.ts";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";
import { isValidJSON } from "lib/jsonUtils.ts";
import { getLogger } from "packages/logger.ts";

const _logger = getLogger(import.meta);

const TweetSuggestionSchema = z.object({
  tweet: z.string().describe(
    "a revised version of the given tweet better suited to fit the users voice, avoiding hashtags if the user doesn't use them",
  ),
  explanation: z.string().describe("an explanation of the revisions made and how they use the user's voice"),
});

const Schema = z.object({
  suggestions: z.array(TweetSuggestionSchema).describe(
    "an array of 5 objects that match the given schema",
  ),
});

const openAi = getAi();

export default openAi;

export const systemPrompty =
  `You are an assistant suggests alternative tweets that are more in line with a persons existing voice on twitter.
`;

const taskPrompty = `here is my draft tweet and a description of my voice.
`;

export async function makeTweets(
  tweet: string,
  voice: string | null = null,
  taskPrompt = taskPrompty,
  systemPrompt = systemPrompty,
) {
  const options = {};
  const content = `*Draft tweet*: ${tweet}

*Voice*: ${voice}`;
  const response = await openAi.chat.completions.create(
    {
      model: "openai/gpt-4o:online",
      response_format: zodResponseFormat(Schema, "schema"),
      temperature: .2,
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "system",
          content: taskPrompt,
        },
        {
          role: "user",
          content,
        },
        {
          role: "system",
          content: "Please return the new tweets using our JSON schema.",
        },
      ],
    },
    options,
  );

  const choice = response.choices[0];
  if (!choice) throw new Error("No choice");

  let suggestions = [];
  if (
    choice.message.content &&
    isValidJSON(choice.message.content)
  ) {
    const json = JSON.parse(choice.message.content);
    suggestions = json.suggestions;
  }

  const responseObject = {
    originalText: content,
    suggestions,
  };
  return responseObject;
}
