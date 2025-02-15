import { getAi } from "lib/ai.ts";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";
import { getLogger } from "packages/logger.ts";
import { isValidJSON } from "lib/jsonUtils.ts";
const logger = getLogger(import.meta);

const Schema = z.object({
  companySummary: z.object({
    revision: z.string().describe(
      "A summary of what your company does in 50 characters or less.",
    ),
    explanation: z.string().describe(
      "An explanation of why the text was recommended",
    ),
    confidence: z.number().describe(
      "A zero to 1 value indicating how confident the AI is in the recommendation",
    ),
  }),
  productSummary: z.object({
    revision: z.string().describe(
      "A description of your product and what it does or will do.",
    ),
    explanation: z.string().describe(
      "An explanation of why the text was recommended",
    ),
    confidence: z.number().describe(
      "A zero to 1 value indicating how confident the AI is in the recommendation",
    ),
  }),
  locationDecision: z.object({
    revision: z.string().describe(
      "a description as to why you chose to be located where you are",
    ),
    explanation: z.string().describe(
      "An explanation of why the text was recommended",
    ),
    confidence: z.number().describe(
      "A zero to 1 value indicating how confident the AI is in the recommendation",
    ),
  }),
  progress: z.object({
    revision: z.string().describe("A description of your product's progress"),
    explanation: z.string().describe(
      "An explanation of why the text was recommended",
    ),
    confidence: z.number().describe(
      "A zero to 1 value indicating how confident the AI is in the recommendation",
    ),
  }),
  workLengthHistory: z.object({
    revision: z.string().describe(
      "A description how long you and your cofounders have worked on this product and how much of it has been full-time",
    ),
    explanation: z.string().describe(
      "An explanation of why the text was recommended",
    ),
    confidence: z.number().describe(
      "A zero to 1 value indicating how confident the AI is in the recommendation",
    ),
  }),
  techStack: z.object({
    revision: z.string().describe(
      "A description of your product's tech stack currently or what you plan to use",
    ),
    explanation: z.string().describe(
      "An explanation of why the text was recommended",
    ),
    confidence: z.number().describe(
      "A zero to 1 value indicating how confident the AI is in the recommendation",
    ),
  }),
  revenueSource: z.object({
    revision: z.string().describe(
      "A description of where your revenue comes from",
    ),
    explanation: z.string().describe(
      "An explanation of why the text was recommended",
    ),
    confidence: z.number().describe(
      "A zero to 1 value indicating how confident the AI is in the recommendation",
    ),
  }),
  previousApplicationChange: z.object({
    revision: z.string().describe(
      "A description of how your idea has changed if you are applying with the same idea as a previous batch, or a description of why you have a new idea, why did you pivoted and what you learned from the last idea?",
    ),
    explanation: z.string().describe(
      "An explanation of why the text was recommended",
    ),
    confidence: z.number().describe(
      "A zero to 1 value indicating how confident the AI is in the recommendation",
    ),
  }),
  otherIncubators: z.object({
    revision: z.string().describe(
      "A description of any other incubators you have participated in or committed to",
    ),
    explanation: z.string().describe(
      "An explanation of why the text was recommended",
    ),
    confidence: z.number().describe(
      "A zero to 1 value indicating how confident the AI is in the recommendation",
    ),
  }),
  reasonForProductChoice: z.object({
    revision: z.string().describe(
      "A description of why you picked this idea to work on, if you have domain expertise in this area, and how you know people need what you're making.",
    ),
    explanation: z.string().describe(
      "An explanation of why the text was recommended",
    ),
    confidence: z.number().describe(
      "A zero to 1 value indicating how confident the AI is in the recommendation",
    ),
  }),
  competitors: z.object({
    revision: z.string().describe(
      "A description of your competitors and what you understand about the business that they done",
    ),
    explanation: z.string().describe(
      "An explanation of why the text was recommended",
    ),
    confidence: z.number().describe(
      "A zero to 1 value indicating how confident the AI is in the recommendation",
    ),
  }),
  moneyMaking: z.object({
    revision: z.string().describe(
      "A description of how you make money, and how much you could you make?",
    ),
    explanation: z.string().describe(
      "An explanation of why the text was recommended",
    ),
    confidence: z.number().describe(
      "A zero to 1 value indicating how confident the AI is in the recommendation",
    ),
  }),
  otherIdeas: z.object({
    revision: z.string().describe(
      "A description of any other ideas you considered applying with",
    ),
    explanation: z.string().describe(
      "An explanation of why the text was recommended",
    ),
    confidence: z.number().describe(
      "A zero to 1 value indicating how confident the AI is in the recommendation",
    ),
  }),
  equityBreakdown: z.object({
    revision: z.string().describe(
      "A description of how your equity is split",
    ),
    explanation: z.string().describe(
      "An explanation of why the text was recommended",
    ),
    confidence: z.number().describe(
      "A zero to 1 value indicating how confident the AI is in the recommendation",
    ),
  }),
  investmentsReceived: z.object({
    revision: z.string().describe(
      "a list of any investments your company has received. Include the name of the investor, the amount invested, the premoney valuation / valuation cap, and the type of security sold (convertible notes, safes or stock).",
    ),
    explanation: z.string().describe(
      "An explanation of why the text was recommended",
    ),
    confidence: z.number().describe(
      "A zero to 1 value indicating how confident the AI is in the recommendation",
    ),
  }),
  reasonForAppling: z.object({
    revision: z.string().describe(
      "A description of why you applied to Y Combinator, and did someone encourage you to apply.",
    ),
    explanation: z.string().describe(
      "An explanation of why the text was recommended",
    ),
    confidence: z.number().describe(
      "A zero to 1 value indicating how confident the AI is in the recommendation",
    ),
  }),
  whoToldYou: z.object({
    revision: z.string().describe(
      "A description of how you heard about Y Combinator, and who told you about it.",
    ),
    explanation: z.string().describe(
      "An explanation of why the text was recommended",
    ),
    confidence: z.number().describe(
      "A zero to 1 value indicating how confident the AI is in the recommendation",
    ),
  }),
});

const openAi = getAi();

export default openAi;

export const systemPrompty =
  `You are an assistant who reviews YCombinator applications and provides feedback on how they can be better written to increase the chance of being accepted into YCombinator.

Here is an example successful application

Company
Describe what your company does in 50 characters or less.
API Bartender for LLM APIs.

What is your company going to make? Please describe your product and what it does or will do.
We are building an API that combines different LLMs for quality and cost optimization. Our machine-learning model sorts tasks based on complexity and specialization, directing them to the best-performing LLM in those categories. This approach allows companies to save costs, as cheaper models can perform equally well in certain areas. Currently, we are 35% cheaper than GPT-4 without sacrificing quality. Startups and SMEs use our service to save money and get better results.

Where do you live now, and where would the company be based after YC?
Chicago, US / San Francisco, US

Founders
Please enter the url of a 1 minute unlisted (not private) YouTube video introducing the founder(s). This video is an important part of the application. (Follow the Video Guidelines.)

How long have the founders known one another and how did you meet? Have any of the founders not met in person?
We met through a mutual friend in college and have been best friends since then. We have been living and working together.

Progress
How far along are you?
We launched our public beta yesterday (10/12). We already have paying customers as well as free trial users. We’re working on integrating Claude, PaLM, and some fine-tuned models.

---- Update 10/27 ----
Over the past two weeks we have been focusing on four things:
1) adding user requested features, such as organization management, usage tracking, and LangChain integration.
2) addressing user concerns, such as GDPR compliance, terms of use, and privacy policy.
3) sales & user engagement - we booked 23 demos up to today and helped 3 companies with custom integration.
4) QA & testing.

How long have each of you been working on this? How much of that has been full-time? Please explain.
We started our company in January and have been working full-time. We pivoted to the current product last month after two previous YC submissions and two failed ideas.

How many active users or customers do you have? If you have some particularly valuable customers, who are they? If you're building hardware, how many units have you shipped?
We have 17 users running our free trial API key since yesterday's launch (10/12). We also have seven B2B customers who are paying and working on integrating our API. Although we don't yet know precisely how much they will pay, we expect ~$500-1500 /user per month based on their current AI usage costs.
The three customers we expect the most revenue from are Customer 1 (B2B knowledge base chatbot, 100+ customers), Customer 2 (SQL copilot, 10k+ users), and Customer 3 (AI for codebase, $10k+ monthly AI spending).

---- Update 10/27 ----
Current revenue = $1968 + ~$100 unbilled usage + (+$399 in transit, payment ran into issues with Stripe). Customer 4 is paying us close to $1800.

Do you have revenue?
Yes
We're interested in your revenue over the last several months. (Not cumulative and not GMV).
All our revenue comes from customer API calls based on usage.
Anything else you would like us to know regarding your revenue or growth rate?
We plan to update our pricing model from subscription-based to solely pay-by-usage, as many users have indicated a preference for this model.

---- Update 10/27 ----
We have updated to usage-based pricing.

If you are applying with the same idea as a previous batch, did anything change? If you applied with a different idea, why did you pivot and what did you learn from the last idea?
We pivoted from an AI job search copilot and learned three key lessons: 1) B2C faces high churn in recruiting. 2) User feedback is vital; building the wrong thing is costly — "make something people want." 3) Quick launches are crucial for finding product-market fit; now we ship in weeks, not months. We believe our current idea is more scalable and can grow very quickly.

Idea
Why did you pick this idea to work on? Do you have domain expertise in this area? How do you know people need what you're making?
We chose this idea after encountering limitations with GPT-3.5 and high costs with GPT-4 in our previous project. The concept actually began as a cost-optimization solution for our own use before we realized its broader application.

With conversations with over a hundred founders in the generative AI space, we have a strong grasp of the domain and customer needs.

We knew people wanted our product when we had more than 20 demos booked on the day we launched. We received many “please consider us for a demo” and “this is such a great product” messages. One customer we talked to today was especially thrilled that we could save them $3,500 monthly on their calls without sacrificing quality.

Who are your competitors, and who might become competitors? Who do you fear most?
Our competitors are companies that offer single or fine-tuned LLMs. We will incorporate these individual LLMs into our product, as well as fine-tune some LLMs for specialized use-cases.

We outperform our competitors in both cost and output quality. As the cost, speed, and quality of individual LLMs like GPT-4 improve, so does our product, ensuring we always maintain a competitive edge. There are no companies working on a combined LLM as of now, and we firmly believe this is the future for LLM usage.

How do or will you make money? How much could you make?
We'll make money with a pay-by-usage API model. Right now our profits are more than half of our revenue. We'll initially target startups and SMBs using generative AI.

With a huge market size of ~$200 billion for the AI market, our current serviceable available market is $2.7 billion.

Equity
Please describe the breakdown of the equity ownership in percentages among the founders, employees and any other stockholders. If there are multiple founders, be sure to give the equity ownership of each founder.
Andy, CEO - 51%
Raymond, CTO - 49%
We also plan to create a 20% employee pool for early hires.

Legal
Who writes code, or does other technical work on your product? Was any of it done by a non-founder? Please explain.
We both write code. Andy does design and frontend; Raymond does full-stack with a focus on ML.

Others
If you had any other ideas you considered applying with, please list them. One may be something we've been waiting for. Often when we fund people it's to do something they list here and not in the main application.
We currently do not have other ideas; however, as a startup that has pivoted twice, we're adaptive and understand the importance of making decisive changes for higher potential projects.

Curious
What convinced you to apply to Y Combinator? Did someone encourage you to apply?
We firmly believe YC can boost our outcome by at least 7%. We plan to use the 3 months at YC to continue focusing on building our product and talking to users — every generative AI YC startup as a potential customer.

How did you hear about Y Combinator?
Andy worked at Yummy Future (YC S19) in 2021 and learned a lot of good things about YC.
`;

const taskPrompty =
  `Here is our application. Please revise the answers to any of the questions to follow the succesful application voice.
`;

export async function runIt(
  content: string,
  taskPrompt = taskPrompty,
  systemPrompt = systemPrompty,
) {
  // return testData;
  const options = {};
  const response = await openAi.chat.completions.create(
    {
      model: "openai/gpt-4o",
      response_format: zodResponseFormat(Schema, "schema"),
      temperature: .5,
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
            "Please return results for the revisions using our  JSON schema.",
        },
      ],
    },
    options,
  );

  logger.info(response);
  const choice = response.choices[0];
  if (!choice) throw new Error("No choice");
  let responseObject = {};
  try {
    responseObject = isValidJSON(choice.message.content ?? "{}")
      ? JSON.parse(choice.message.content ?? "{}")
      : {};
    return responseObject;
  } catch (e) {
    logger.error(e);
    return responseObject;
  }
}

const _testData = {
  "companySummary": {
    "revision": "AI-powered open-source CMS alternative",
    "explanation":
      "The revision succinctly captures the essence of the company by emphasizing the AI aspect and the open-source nature, which aligns with the trend of AI integration in tech products.",
    "confidence": 0.9,
  },
  "productSummary": {
    "revision":
      "We’re developing an AI-driven platform that aids content creators in crafting and editing blog posts to maintain a consistent voice. Users can input inspirational content or describe their desired voice, and our system suggests improvements for storytelling elements like tone, active voice, and narrative structure. This tool is the first step towards a broader vision of an open-source platform that empowers content creators and companies to scale their storytelling across various media and platforms, potentially replacing tools like WordPress.",
    "explanation":
      "The revision clarifies the product's current functionality and future vision, emphasizing the AI-driven aspect and its potential to replace existing solutions like WordPress.",
    "confidence": 0.95,
  },
  "locationDecision": {
    "revision":
      "We are based in NYC due to our initial team concentration there, but we embrace a distributed, remote team culture to leverage talent from anywhere.",
    "explanation":
      "The revision emphasizes the strategic choice of location while highlighting the company's commitment to a remote work culture, which is increasingly relevant in the tech industry.",
    "confidence": 0.85,
  },
  "progress": {
    "revision":
      "We launched a prototype on Hacker News today (2/7) and have started building a developer community around our open-source project. We are collaborating with two design partners, AstroForge (W22) and Pattern, generating revenue of $12k and $3k per month, respectively.",
    "explanation":
      "The revision provides a clear update on the product's launch and progress, highlighting key partnerships and revenue generation, which are critical for demonstrating traction.",
    "confidence": 0.9,
  },
  "workLengthHistory": {
    "revision":
      "We began coding in April 2023 and have been fully committed to working on the project full-time since November 2023.",
    "explanation":
      "The revision provides a clear timeline of the project's development and the founders' commitment, which is important for demonstrating dedication and focus.",
    "confidence": 0.9,
  },
  "techStack": {
    "revision":
      "Our tech stack includes Deno, Postgres, React, GraphQL, and Isograph.",
    "explanation":
      "The revision clearly lists the technologies used, which is important for technical clarity and understanding the foundation of the product.",
    "confidence": 0.9,
  },
  "revenueSource": {
    "revision":
      "Our current revenue is derived from our design partners, AstroForge and Pattern.",
    "explanation":
      "The revision succinctly states the current revenue sources, which is important for understanding the financial foundation of the company.",
    "confidence": 0.9,
  },
  "previousApplicationChange": {
    "revision":
      "Initially, our focus was too narrow. Through customer interactions and product development, we learned that determining what content to create is a more significant challenge than the creation process itself. Businesses, especially startups, struggle with starting and identifying effective content marketing strategies. After defining the content, tools are less of an issue. The market for improving video content alone wasn't large enough for our ambitions, prompting us to pivot.",
    "explanation":
      "The revision provides a clear explanation of the pivot and the insights gained, which is crucial for demonstrating learning and adaptability.",
    "confidence": 0.95,
  },
  "otherIncubators": {
    "revision": "N/A",
    "explanation":
      "The response is clear and concise, indicating that the company has not participated in other incubators, which is important for transparency.",
    "confidence": 0.9,
  },
  "reasonForProductChoice": {
    "revision":
      "As video producers, creators, and musicians, we've spent years helping people create compelling content. Our team was formed at Vidpresso (W14) and honed at Facebook, where we built scalable products. At Content Foundry, we aim to leverage our expertise to help others tell great stories. Through extensive customer research and prototyping, we've identified a gap in storytelling for technical founders at startups, who understand the importance of organic growth through stories but lack the media expertise to achieve it.",
    "explanation":
      "The revision effectively communicates the founders' background, expertise, and the insights that led to the current product focus, which is crucial for establishing credibility and market understanding.",
    "confidence": 0.95,
  },
  "competitors": {
    "revision":
      "Our initial product competes with tools like Grammarly or Jasper, which focus on text generation. However, we offer a comprehensive solution that integrates the entire content lifecycle, from story crafting to publication and analytics. In the long term, we aim to compete with open-source CMS platforms like WordPress, Strapi, and Ghost by offering an AI-native content operating system that manages content creation and distribution in one place.",
    "explanation":
      "The revision clearly outlines the competitive landscape and how the product differentiates itself, which is important for understanding market positioning.",
    "confidence": 0.95,
  },
  "moneyMaking": {
    "revision":
      "We plan to monetize by offering a cloud-hosted version of our open-source software, similar to the WordPress model. The content creation and management industry is a multi-billion dollar market, and WordPress powers a significant portion of the web. We are initially targeting technical founders at seed and series A startups to refine our product before expanding to broader markets.",
    "explanation":
      "The revision provides a clear monetization strategy and market opportunity, which is important for understanding the business model and growth potential.",
    "confidence": 0.95,
  },
  "otherIdeas": {
    "revision":
      "We are focused on our current idea but remain open to pivoting as needed, based on market feedback and opportunities.",
    "explanation":
      "The revision indicates flexibility and openness to change, which is important for demonstrating adaptability in a startup environment.",
    "confidence": 0.85,
  },
  "equityBreakdown": {
    "revision":
      "Randall Bennett, CEO - 16%, Justin Carter, Software Engineer - 16%, Josh LeVitre, Software Engineer - 16%, George LeVitre, Software Engineer - 16%, Dan Sisco, COO - 16%, with a 20% equity pool for future hires.",
    "explanation":
      "The revision provides a clear and detailed breakdown of equity, which is important for understanding ownership and potential employee incentives.",
    "confidence": 0.9,
  },
  "investmentsReceived": {
    "revision": "We have not received any investments yet.",
    "explanation":
      "The revision clearly states the current investment status, which is important for transparency and understanding the financial position of the company.",
    "confidence": 0.9,
  },
  "reasonForAppling": {
    "revision":
      "We previously participated in the W14 batch with Vidpresso and experienced the immense value of the YC network and resources. We believe YC can significantly accelerate our growth and help us refine our product and market strategy.",
    "explanation":
      "The revision explains the motivation for reapplying to YC, emphasizing past positive experiences and the benefits of the YC network, which is important for demonstrating commitment and understanding of YC's value.",
    "confidence": 0.9,
  },
  "whoToldYou": {
    "revision": "Paul Graham (PG) introduced us to Y Combinator.",
    "explanation":
      "The revision clearly states who introduced the team to YC, which is important for understanding the source of influence and connection to YC.",
    "confidence": 0.9,
  },
};
