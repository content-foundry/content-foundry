import { getAi } from "lib/ai.ts";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";
import { getLogger } from "packages/logger.ts";
import { isValidJSON } from "lib/jsonUtils.ts";
const _logger = getLogger(import.meta);

const blogRevisionsSchema = z.object({
  revisionTitle: z.string().describe(
    "a short title for the revision being suggested",
  ),
  original: z.string().describe(
    "the original portion of text being revised",
  ),
  instructions: z.string().describe(
    "specific instructions for how to improve the original text pointing to common speech concepts. Be explicit about which speech patterns to adjust (sentence length, word choice, metaphors, etc.) and provide clear direction on how to achieve a voice more consistent with the author.",
  ),
  revision: z.string().describe(
    "the revised text better suited to the users voice",
  ),
  explanation: z.string().describe(
    "an explanation of the revisions made and how they use the user's voice",
  ),
});

const Schema = z.object({
  revisions: z.array(blogRevisionsSchema).describe(
    "an array of objects that match the given schema",
  ),
});

const openAi = getAi();

export const systemPrompty =
  `You are an instructor who analyzes a blog post and instructs the writer on how to make it better so it better suits the users voice.
`;

const taskPrompty =
  `Here is the blog post, please instruct me on how to improve the text so it better suits my voice. Suggest revisions based on the instructions given.
`;

export async function reviseBlog(
  blog: string,
  voice: string | null = null,
  taskPrompt = taskPrompty,
  systemPrompt = systemPrompty,
) {
  const options = {};
  const content = `*BlogPost*: ${blog} to revise.

  and *Voice*: ${voice} to revise it with`;
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
          content: "Please return results using our JSON schema.",
        },
        {
          role: "system",
          content:
            `Please reference the user's voice in order to instruct: ${voice}`,
        },
      ],
    },
    options,
  );

  const choice = response.choices[0];
  if (!choice) {
    throw new Error("No choice");
  }

  let revisions = [];
  if (
    choice.message.content &&
    isValidJSON(choice.message.content)
  ) {
    const json = JSON.parse(choice.message.content);
    revisions = json.revisions;
  }

  const responseObject = {
    draftBlog: blog,
    revisions,
  };
  return responseObject;
}
