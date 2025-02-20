import { getAi } from "lib/ai.ts";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";
import { getLogger } from "packages/logger.ts";
import { isValidJSON } from "lib/jsonUtils.ts";

const Schema = z.object({
  voiceSummary: z.string().describe(
    "3 to 5 adjectives describing the persons voice based on their tweets and info",
  ),
  voice: z.string().describe(
    "a description of the persons voice based on their tweets and info. Perhaps compare their voice to an influencial person on twitter with evidence to support it.",
  ),
});

const openAi = getAi();

export default openAi;

export const systemPrompty =
  `You are an assistant who analyzes a persons twitter profile and tweets in order to give them a summary of their voice on twitter
`;

const taskPrompty =
  `Here is my twitter handle, please analyze my profile by searching the web for it and give me tell me about my voice
`;

export async function getVoice(
  content: string,
  taskPrompt = taskPrompty,
  systemPrompt = systemPrompty,
) {
  const options = {};
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
          content:
            "Please return results for the voice using our  JSON schema.",
        },
      ],
    },
    options,
  );

  const choice = response.choices[0];
  if (!choice) throw new Error("No choice");
  let responseObject = { voice: "", voiceSummary: "" };
  try {
    responseObject =
      isValidJSON(choice.message.content ?? '{voice: "", voiceSummary: ""}')
        ? JSON.parse(choice.message.content ?? '{voice: "", voiceSummary: ""}')
        : { voice: "", voiceSummary: "" };
    return responseObject;
  } catch (e) {
    return responseObject;
  }
}
