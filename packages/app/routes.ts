import { PageUIDemo } from "packages/app/pages/PageUIDemo.tsx";
import type { IsographEntrypoint } from "@isograph/react";
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
  ["/ui", { Component: PageUIDemo }],
  ["/fcp", { Component: FinalCutProXML }],
]);

// deno-lint-ignore no-explicit-any
export type IsographRoute = IsographEntrypoint<any, RouteEntrypoint>;

export type RouteEntrypoint = {
  Body: React.FC | null | undefined;
  title: string;
};

import {
  entrypointBlog,
  entrypointBlogPost,
  entrypointContentFoundryApp,
  entrypointFormatter,
  entrypointFormatterEditor,
  entrypointFormatterVoice,
  entrypointHome,
  entrypointTwitterIdeator,
  entrypointTwitterIdeatorCompose,
  entrypointTwitterIdeatorResearch,
  entrypointTwitterIdeatorVoice,
  entrypointTwitterIdeatorWorkshop,
} from "packages/app/__generated__/builtRoutes.ts";

export const loggedInAppRoutes = new Map<string, IsographRoute>([
  ["/formatter", entrypointFormatter],
  ["/formatter/editor/:editorSlug?", entrypointFormatterEditor],
  ["/formatter/voice", entrypointFormatterVoice],
  ["/twitter", entrypointTwitterIdeator],
  ["/twitter/voice", entrypointTwitterIdeatorVoice],
  ["/twitter/research/:researchSlug?", entrypointTwitterIdeatorResearch],
  [
    "/twitter/workshopping/:workshoppingSlug?",
    entrypointTwitterIdeatorWorkshop,
  ],
  ["/twitter/compose", entrypointTwitterIdeatorCompose],
]);

export const isographAppRoutes = new Map<string, IsographRoute>([
  ["/", entrypointHome],
  ["/login", entrypointContentFoundryApp],
  ["/blog/:slug", entrypointBlogPost],
  ["/blog", entrypointBlog],
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
