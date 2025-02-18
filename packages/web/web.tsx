#! /usr/bin/env -S deno run --allow-net=localhost:8000 --allow-env

import React from "react";
import { renderToReadableStream } from "react-dom/server";
import {
  appRoutes,
  isographAppRoutes,
  type RouteEntrypoint,
} from "packages/app/routes.ts";
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

// Optionally remove UI route from non-dev environments
if (getConfigurationVariable("BF_ENV") !== DeploymentEnvs.DEVELOPMENT) {
  appRoutes.delete("/ui");
}

// Register each app route in the routes Map
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

    const HeaderComponent = RouteHeaderComponent ?? AppRoot.HeaderComponent;
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
    return new Response(stream, {
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  });
}

// Register isograph routes
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

    // Because this route is isograph-based, we dynamically generate a header component
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
    return new Response(stream, {
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  });
}

// Serve static files
routes.set("/static/:filename+", function staticHandler(req) {
  return serveDir(req, {
    headers: [
      "Cache-Control: public, must-revalidate",
      "ETag: true",
    ],
  });
});

// GraphQL handler
routes.set("/graphql", graphQLHandler);

// Example for handling form uploads with AssemblyAI
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

    const data = { audio: file };
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

// Simple logout route that clears cookies
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

// Fallback default route
function defaultRoute() {
  logger.setLevel(logger.levels.DEBUG);
  return new Response("Not found™", { status: 404 });
}

/**
 * If there's a mismatch in trailing slash (e.g. user typed "/foo" but route is "/foo/"),
 * `matchRouteWithParams` sets `needsRedirect=true` and `redirectTo="/foo/"`.
 */
function matchRoute(
  pathWithParams: string,
): [Handler, Record<string, string>, boolean, string?] {
  const match = matchRouteWithParams(pathWithParams);
  const matchedHandler = routes.get(match.pathTemplate) || defaultRoute;
  const routeParams = match.routeParams;
  const needsRedirect = match.needsRedirect;
  const redirectTo = match.redirectTo;
  return [matchedHandler, routeParams, needsRedirect, redirectTo];
}

logger.info("Ready to serve");

const staticPrefix = "/static";
function staticHandler(req: Request) {
  return serveDir(req, {
    headers: [
      "Cache-Control: public, must-revalidate",
      "ETag: true",
    ],
  });
}

// Use the port from environment or default 8000
const port = Number(Deno.env.get("WEB_PORT") ?? 8000);

if (import.meta.main) {
  Deno.serve({ port }, async (req) => {
    const incomingUrl = new URL(req.url);

    if (incomingUrl.pathname.startsWith(staticPrefix)) {
      return staticHandler(req);
    }

    const timer = performance.now();
    try {
      // Keep the query string, so we pass "pathname + search" to matchRoute
      const pathWithParams = incomingUrl.pathname + incomingUrl.search;
      const [handler, routeParams, needsRedirect, redirectTo] = matchRoute(
        pathWithParams,
      );

      if (needsRedirect && redirectTo) {
        // Canonicalize trailing slash mismatch with a permanent redirect
        // (could use 302 if you prefer)
        const redirectUrl = new URL(redirectTo, req.url);
        return Response.redirect(redirectUrl, 301);
      }

      const res = await handler(req, routeParams);

      // Optionally set security headers, etc.
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
          req.headers.get("content-type") ?? ""
        } (${perfInMs}ms)`,
      );

      return res;
    } catch (err) {
      logger.error("Error handling request:", err);
      return new Response("Internal Server Error", { status: 500 });
    }
  });
}
