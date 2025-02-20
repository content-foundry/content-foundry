import { objectType } from "nexus";
import { graphqlBfNode } from "packages/graphql/types/graphqlBfNode.ts";

export const exampleBfOrg = {
  __typename: "BfOrganization",
  id: "lol",
  // identity: null,
  identity: {
    twitter: {
      handle: "George_LeVitre",
      name: "George LeVitre",
      imgUrl:
        "https://m.media-amazon.com/images/M/MV5BMTY5MDc0ODkyNV5BMl5BanBnXkFtZTcwODI4ODg3Ng@@._V1_FMjpg_UX1000_.jpg",
    },
    voiceSummary: `- Witty
- Direct
- Lightly irreverent`,
    voice:
      `You’re aiming for a voice that is witty, direct, and lightly irreverent—one that breaks away from stale corporate talk but still comes across as knowledgeable and genuine. This approach is casual enough to feel human-friendly, yet firmly grounded in expertise so your audience trusts what you say.\n
You sound like a mix between Richard Feynman (for his ability to make complex concepts accessible with wit and charm) and Anthony Bourdain (for his sharp cultural observations and no-BS authenticity).`,
  },
  research: {
    topics: [
      {
        name: "Current Events",
        entries: [],
      },
      {
        name: "Sports",
        entries: [{
          type: "sport",
          name: "U.S. Olympic Mixed Doubles Curling Trials",
          summary:
            "The trials to determine the U.S. representatives for mixed doubles curling at the upcoming Olympics are taking place in Lafayette, Colorado, from February 17 to 23, 2025.",
          url:
            "https://www.sportstravelmagazine.com/2025-sports-calendar-the-year-in-major-events/",
        }, {
          type: "sport",
          name: "ISU Four Continents Figure Skating Championship",
          summary:
            "Top figure skaters from four continents are competing in Seoul from February 19 to 23, 2025.",
          url:
            "https://www.sportstravelmagazine.com/2025-sports-calendar-the-year-in-major-events/",
        }, {
          type: "sport",
          name: "Major League Baseball Spring Training",
          summary:
            "MLB teams begin their spring training on February 20, 2025, marking the start of preparations for the upcoming season.",
          url:
            "https://www.sportstravelmagazine.com/2025-sports-calendar-the-year-in-major-events/",
        }, {
          type: "sport",
          name: "USA Gymnastics Winter Cup",
          summary:
            "Gymnasts from across the country are gathering in Louisville, Kentucky, for the Winter Cup from February 20 to 23, 2025.",
          url:
            "https://www.sportstravelmagazine.com/2025-sports-calendar-the-year-in-major-events/",
        }, {
          type: "sport",
          name: "Premier League Darts Night 3",
          summary:
            "The third night of the Premier League Darts takes place at the 3Arena in Dublin on February 20, 2025, featuring top darts players competing for points.",
          url:
            "https://talksport.com/darts/2934828/premier-league-darts-night-3-live-start-schedule-results-winner-luke-littler/",
        }, {
          type: "sport",
          name: "NBA Regular Season Games",
          summary:
            "The NBA regular season continues with multiple games scheduled throughout the week, including matchups like Hornets vs. Lakers on February 19 and Grizzlies vs. Pacers on February 20.",
          url: "https://www.nba.com/schedule",
        }],
      },
    ],
  },
  creation: {
    originalText:
      "Here is the text from my tweet that I wrote. It isn’t very good.",
    suggestions: [
      "I wrote this tweet, but it’s giving ‘meh.’ What can I do to make it ‘wow’?",
      "This is the text from my tweet. I’m not sure it’s great—how can I improve it?",
      "Here’s what I wrote for my tweet. It feels a bit off. Any ideas to make it better?",
      "Here’s the text of my tweet. I think it could use some improvement. Thoughts?",
      "I wrote this tweet, but I’m not fully happy with it. What could make it stronger?",
    ],
  },
  distribution: {},
  analytics: {},
};
export const graphqlIdentityType = objectType({
  name: "BfOrganization_Identity",
  definition(t) {
    t.field("twitter", {
      type: objectType({
        name: "Twitter",
        definition(t) {
          t.string("handle");
          t.string("name");
          t.string("imgUrl");
        },
      }),
    });
    t.string("voiceSummary");
    t.string("voice");
  },
});

export const graphqlResearchType = objectType({
  name: "BfOrganization_Research",
  definition(t) {
    t.list.field("topics", {
      type: objectType({
        name: "ResearchTopic",
        definition(t) {
          t.string("name");
          t.list.field("entries", {
            type: objectType({
              name: "ResearchEntry",
              definition(t) {
                t.string("type");
                t.string("name");
                t.string("summary");
                t.string("url");
              },
            }),
          });
        },
      }),
    });
  },
});

export const graphqlCreationType = objectType({
  name: "Creation",
  definition(t) {
    t.string("originalText");
    t.list.string("suggestions");
  },
});

export const graphqlDistributionType = objectType({
  name: "Distribution",
  definition(t) {
    t.string("tbd");
  },
});

export const graphqlAnalyticsType = objectType({
  name: "Analytics",
  definition(t) {
    t.string("tbd");
  },
});

export const graphqlBfOrganizationType = objectType({
  name: "BfOrganization",
  definition(t) {
    t.implements(graphqlBfNode);
    t.field("identity", {
      type: graphqlIdentityType,
    });
    t.field("research", {
      type: graphqlResearchType,
    });
    t.field("creation", {
      type: graphqlCreationType,
    });
    t.field("distribution", {
      type: graphqlDistributionType,
    });
    t.field("analytics", {
      type: graphqlAnalyticsType,
    });
  },
});
