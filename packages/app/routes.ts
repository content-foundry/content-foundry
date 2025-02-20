import { PageUIDemo } from "packages/app/pages/PageUIDemo.tsx";

import entrypointBlog from "packages/app/__generated__/__isograph/Query/EntrypointBlog/entrypoint.ts";
import entrypointBlogPost from "packages/app/__generated__/__isograph/Query/EntrypointBlogPost/entrypoint.ts";
import entrypointApp from "packages/app/__generated__/__isograph/Query/EntrypointContentFoundryApp/entrypoint.ts";
import type { IsographEntrypoint } from "@isograph/react";
import { iso } from "packages/app/__generated__/__isograph/iso.ts";
import { FinalCutProXML } from "packages/tools/FinalCutProXML.tsx";

function fileHandlerFactory(url: string) {
  return function FileHandler() {
    return url;
  };
}

export type ComponentWithHeader = React.ComponentType<unknown> & {
  HeaderComponent?: React.ComponentType<unknown>;
};

export type RouteGuts = {
  Component: ComponentWithHeader;
};

export type RouteMap = Map<string, RouteGuts>;

export const appRoutes: RouteMap = new Map([
  ["/", { Component: PageMarketing }],
  ["/ui", { Component: PageUIDemo }],
  ["/fcp", { Component: FinalCutProXML }],
]);

// deno-lint-ignore no-explicit-any
export type IsographRoute = IsographEntrypoint<any, RouteEntrypoint>;

export type RouteEntrypoint = {
  Body: React.FC | null | undefined;
  title: string;
};

iso(`entrypoint Query.EntrypointBlog`);
iso(`entrypoint Query.EntrypointBlogPost`);
iso(`entrypoint Query.EntrypointContentFoundryApp`);
iso(`entrypoint Query.EntrypointDocs`);
iso(`entrypoint Query.EntrypointDocsPost`);
iso(`entrypoint Query.EntrypointTwitterIdeator`);
iso(`entrypoint Query.EntrypointTwitterIdeatorWorkshop`);
iso(`entrypoint Query.entrypointTwitterIdeatorResearch`);
iso(`entrypoint Query.EntrypointTwitterIdeatorVoice`);

import entrypointDocs from "packages/app/__generated__/__isograph/Query/EntrypointDocs/entrypoint.ts";
import entrypointDocsPost from "packages/app/__generated__/__isograph/Query/EntrypointDocsPost/entrypoint.ts";
import entrypointTwitterIdeator from "packages/app/__generated__/__isograph/Query/EntrypointTwitterIdeator/entrypoint.ts";
import entrypointTwitterIdeatorWorkshop from "packages/app/__generated__/__isograph/Query/EntrypointTwitterIdeatorWorkshop/entrypoint.ts";
import entrypointTwitterIdeatorResearch from "packages/app/__generated__/__isograph/Query/entrypointTwitterIdeatorResearch/entrypoint.ts";
import entrypointTwitterIdeatorVoice from "packages/app/__generated__/__isograph/Query/EntrypointTwitterIdeatorVoice/entrypoint.ts";
import { PageMarketing } from "packages/app/pages/PageMarketing.tsx";

export const loggedInAppRoutes = new Map<string, IsographRoute>([
  ["/twitter", entrypointTwitterIdeator],
  ["/twitter/voice", entrypointTwitterIdeatorVoice],
  ["/twitter/research/:researchSlug?", entrypointTwitterIdeatorResearch],
  [
    "/twitter/workshopping/:workshoppingSlug?",
    entrypointTwitterIdeatorWorkshop,
  ],
]);

export const isographAppRoutes = new Map<string, IsographRoute>([
  ["/login", entrypointApp],
  ["/blog/:slug", entrypointBlogPost],
  ["/blog", entrypointBlog],
  ["/docs/:docsSlug", entrypointDocsPost],
  ["/docs", entrypointDocs],
  ...loggedInAppRoutes,
]);

export const toolRoutes: RouteMap = new Map([
  ["/tools/jupyter-notebook", {
    Component: fileHandlerFactory("jupyter-notebook-open"),
  }],
  ["/tools/jupyter-console", {
    Component: fileHandlerFactory("jupyter-console-open"),
  }],
  ["/tools/sapling", {
    Component: fileHandlerFactory("sapling-open"),
  }],
]);
