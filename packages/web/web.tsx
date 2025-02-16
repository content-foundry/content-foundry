#! /usr/bin/env -S deno run --allow-net=localhost:8000 --allow-env 

import React from "react";
import { renderToReadableStream, renderToString } from "react-dom/server";
import {
  appRoutes,
  isographAppRoutes,
  type RouteEntrypoint,
  toolRoutes,
} from "packages/app/routes.ts";
import { addTools } from "infra/bff/tools.ts";
import { ServerRenderedPage } from "packages/app/server/components/ServerRenderedPage.tsx";
import { AppRoot } from "packages/app/AppRoot.tsx";
import { serveDir } from "@std/http";
import type { ServerProps } from "packages/app/contexts/AppEnvironmentContext.tsx";
import { ClientRoot } from "packages/app/ClientRoot.tsx";
import { graphQLHandler } from "packages/graphql/graphqlServer.ts";
import { getIsographEnvironment } from "packages/app/server/isographEnvironment.ts";

import { getLogger } from "packages/logger.ts";
import { AppEnvironmentProvider } from "packages/app/contexts/AppEnvironmentContext.tsx";
import {
  type IsographEntrypoint,
  useLazyReference,
  useResult,
} from "@isograph/react";
import { matchRouteWithParams } from "packages/app/contexts/RouterContext.tsx";
import { AssemblyAI } from "assemblyai";
import { getConfigurationVariable } from "packages/getConfigurationVariable.ts";

const logger = getLogger(import.meta);

function IsographHeaderComponent(
  // deno-lint-ignore no-explicit-any
  { entrypoint }: { entrypoint: IsographEntrypoint<any, RouteEntrypoint> },
) {
  const { fragmentReference } = useLazyReference(entrypoint, {});
  const result = useResult(fragmentReference);
  const title = result.title;
  return <title className="dynamic">{title}</title>;
}
function getIsographHeaderComponent(
  environment: ServerProps,
  // deno-lint-ignore no-explicit-any
  entrypoint: IsographEntrypoint<any, RouteEntrypoint>,
) {
  return function IsographHeader() {
    return (
      <AppEnvironmentProvider {...environment}>
        <IsographHeaderComponent entrypoint={entrypoint} />
      </AppEnvironmentProvider>
    );
  };
}

export enum DeploymentEnvs {
  DEVELOPMENT = "DEVELOPMENT",
  STAGING = "STAGING",
  PRODUCTION = "PRODUCTION",
}

export type Handler = (
  request: Request,
  routeParams: Record<string, string>,
) => Promise<Response> | Response;

const routes = new Map<string, Handler>();

if (getConfigurationVariable("BF_ENV") !== DeploymentEnvs.DEVELOPMENT) {
  // remove UI route from non dev environments
  appRoutes.delete("/ui");
}

for (const entry of appRoutes.entries()) {
  const [path, { Component: { HeaderComponent: RouteHeaderComponent } }] =
    entry;
  routes.set(path, async function AppRoute(request, routeParams) {
    const reqUrl = new URL(request.url);
    const initialPath = reqUrl.pathname;
    const queryParams = Object.fromEntries(reqUrl.searchParams.entries());
    const isographServerEnvironment = await getIsographEnvironment(request);
    const clientEnvironment = {
      initialPath,
      queryParams,
      routeParams,
      path,
      posthogKey: getConfigurationVariable("POSTHOG_API_KEY") ?? "",
    };

    const serverEnvironment: ServerProps = {
      ...clientEnvironment,
      IS_SERVER_RENDERING: true,
      isographServerEnvironment,
    };

    const HeaderComponent = RouteHeaderComponent ??
      AppRoot.HeaderComponent;
    const headerElement = React.createElement(HeaderComponent);
    const appElement = React.createElement(
      ClientRoot,
      serverEnvironment,
      React.createElement(AppRoot),
    );
    const element = React.createElement(
      ServerRenderedPage,
      { headerElement, environment: clientEnvironment },
      appElement,
    );

    const stream = await renderToReadableStream(element);
    return new Response(
      stream,
      { headers: { "content-type": "text/html" } },
    );
  });
}

for (const [path, entrypoint] of isographAppRoutes.entries()) {
  logger.debug(`Registering ${path}`, entrypoint);
  routes.set(path, async function AppRoute(request, routeParams) {
    const reqUrl = new URL(request.url);
    const initialPath = reqUrl.pathname;
    const queryParams = Object.fromEntries(reqUrl.searchParams.entries());
    const isographServerEnvironment = await getIsographEnvironment(request);
    logger.debug("path", path);
    logger.debug("entrypoint", entrypoint);
    const clientEnvironment = {
      initialPath,
      queryParams,
      routeParams,
      path,
      posthogKey: getConfigurationVariable("POSTHOG_API_KEY") ?? "",
    };

    const serverEnvironment: ServerProps = {
      ...clientEnvironment,
      IS_SERVER_RENDERING: true,
      isographServerEnvironment,
    };

    const HeaderComponent = getIsographHeaderComponent(
      serverEnvironment,
      entrypoint,
    );

    const headerElement = React.createElement(HeaderComponent);

    const appElement = React.createElement(
      ClientRoot,
      serverEnvironment,
      React.createElement(AppRoot),
    );
    const element = React.createElement(
      ServerRenderedPage,
      { headerElement, environment: clientEnvironment },
      appElement,
    );

    const stream = await renderToReadableStream(element);
    return new Response(
      stream,
      { headers: { "content-type": "text/html" } },
    );
  });
}

routes.set("/static/:filename+", function staticHandler(req) {
  return serveDir(req, {
    headers: [
      "Cache-Control: public, must-revalidate",
      "ETag: true",
    ],
  });
});

routes.set("/graphql", graphQLHandler);
routes.set("/assemblyai", async (req) => {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return new Response("No file provided", { status: 400 });
    }

    const client = new AssemblyAI({
      apiKey: getConfigurationVariable("ASSEMBLY_AI_KEY") as string,
    });

    const data = {
      audio: file,
    };

    const transcript = await client.transcripts.transcribe(data);
    const words = transcript.words;

    return new Response(JSON.stringify(words), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    logger.error(error);
    return new Response("Internal server error", { status: 500 });
  }
});

routes.set("/logout", function logoutHandler() {
  const headers = new Headers();
  headers.set("location", "/");
  headers.set(
    "set-cookie",
    "bfgat=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT",
  );
  headers.set(
    "set-cookie",
    "bfgrt=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT",
  );
  return new Response(null, {
    status: 302,
    headers,
  });
});

function defaultRoute() {
  return new Response("Not found", { status: 404 });
}

function matchRoute(pathWithParams: string): [Handler, Record<string, string>] {
  // this is a hack. Static is a backend only route, similar to graphql,
  // but we have to pull the filename. Slicing off the first chunk is a fast
  // way to get the filename.
  if (pathWithParams.startsWith("/static/")) {
    const staticHandler = routes.get("/static/:filename+");
    return [staticHandler || defaultRoute, {
      filename: pathWithParams.slice(8),
    }];
  }

  const match = matchRouteWithParams(pathWithParams);
  const matchedHandler = routes.get(match.pathTemplate);
  const routeParams = match.routeParams;

  logger.debug(matchedHandler);

  return [matchedHandler || defaultRoute, routeParams];
}

logger.info("Ready to serve");

const pythonPrefix = "/python";
async function pythonHandler(req: Request) {
  const pythonPort = Deno.env.get("PYTHON_PORT") ?? "3333";
  const incomingUrl = new URL(req.url);
  const path = incomingUrl.pathname.replace(pythonPrefix, "");
  const pythonUrl = new URL(
    `http://0.0.0.0:${pythonPort}${path}${incomingUrl.search}`,
  );

  const pythonReq = new Request(pythonUrl.toString(), {
    method: req.method,
    headers: req.headers,
    body: req.body,
  });

  const pythonResponse = await fetch(pythonReq);
  if (!pythonResponse.ok) {
    logger.error("Python server response not ok:", pythonResponse.status);
    return new Response("Python server error", { status: 500 });
  }
  return pythonResponse;
}

if (import.meta.main) {
  Deno.serve(async (req) => {
    const incomingUrl = new URL(req.url);
    if (incomingUrl.pathname.startsWith(pythonPrefix)) {
      return pythonHandler(req);
    }
    const timer = performance.now();

    try {
      const [matchedHandler, routeParams] = matchRoute(incomingUrl.pathname);
      const res = await matchedHandler(req, routeParams);

      // if (getConfigurationVariable("BF_ENV") !== DeploymentEnvs.DEVELOPMENT) {
      //   res.headers.set("X-Frame-Options", "DENY");
      //   res.headers.set(
      //     "Content-Security-Policy",
      //     "frame-ancestors 'self' replit.dev",
      //   );
      // }
      const perf = performance.now() - timer;
      const perfInMs = Math.round(perf);
      logger.info(
        `[${
          new Date().toISOString()
        }] [${req.method}] ${res.status} ${incomingUrl} ${
          req.headers.get("content-type")
        } (${perfInMs}ms)`,
      );

      return res;
    } catch (err) {
      // Log the error. If it's a disconnect, this helps track it.
      logger.error("Error handling request:", err);
      // Return a safe fallback response.
      return new Response("Internal Server Error", { status: 500 });
    }
  });
}
