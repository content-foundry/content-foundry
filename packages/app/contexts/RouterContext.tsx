import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import {
  appRoutes,
  type ComponentWithHeader,
  isographAppRoutes,
  type RouteGuts,
} from "packages/app/routes.ts";
import { createPortal } from "react-dom";
import { BfDsFullPageSpinner } from "packages/bfDs/components/BfDsSpinner.tsx";

import { getLogger } from "packages/logger.ts";
const logger = getLogger(import.meta);

import { usePostHog } from "posthog-js/react";

export const registeredRoutes = new Set<string>();
export const dynamicRoutes = new Set<string>();

/**
 * @example
 * addRoute("/projects/:projectId?");
 * addRoute("/projects");
 * addRoute("/");
 * addRoute("/signup/:plan?/");
 *
 * Note: we no longer remove trailing slash from 'path'.
 * We store it exactly as the user wrote, so we know if
 * the canonical route has a slash or not.
 */
function addRoute(path: string) {
  if (path.includes(":")) {
    dynamicRoutes.add(path);
  } else {
    registeredRoutes.add(path);
  }
}

type MatchedRoute = {
  match: boolean;
  params: Record<string, string>;
  queryParams: Record<string, string>;
  routeParams: Record<string, string>;
  route?: RouteGuts;
  pathTemplate: string;
  /** Whether the user's request had a trailing slash mismatch vs the canonical route. */
  needsRedirect: boolean;
  /** If you want to store the exact path to which you'd redirect, you can do it here. */
  redirectTo?: string;
};

/**
 * Utility function:
 * - strips trailing slash from the given path unless it's literally "/"
 * - returns both the "trimmed" string plus a boolean indicating whether
 *   the original string ended with slash (and wasn't just "/").
 */
function trimTrailingSlash(path: string) {
  if (path === "/") {
    return { trimmed: "/", endedWithSlash: false };
  }
  if (path.endsWith("/")) {
    return {
      trimmed: path.slice(0, -1),
      endedWithSlash: true,
    };
  }
  return { trimmed: path, endedWithSlash: false };
}

/**
 * Attempt to match pathRaw (like "/projects/123/") against:
 * - either the explicitly passed pathTemplate
 * - or all dynamicRoutes if none is provided
 *
 * We'll do "loose" matching ignoring trailing slash for param extraction,
 * but also track whether the user actually ended with a slash vs whether
 * the canonical pathTemplate ends with a slash. If there's a mismatch,
 * we set 'needsRedirect' so the caller can do a 301/302 to fix the URL.
 */
export function matchRouteWithParams(
  pathRaw = "",
  pathTemplate?: string,
): MatchedRoute {
  const [rawPath, search] = pathRaw.split("?");
  const searchParams = new URLSearchParams(search);
  const queryParams = Object.fromEntries(searchParams.entries());

  // parse the user's raw path, ignoring trailing slash for matching
  const { trimmed: userPath, endedWithSlash: userSlash } = trimTrailingSlash(rawPath);

  const defaultParams: MatchedRoute = {
    match: false,
    params: {},
    queryParams,
    route: appRoutes.get(rawPath), // fallback in case there's no dynamic match
    routeParams: {},
    pathTemplate: pathTemplate ?? rawPath,
    needsRedirect: false,
  };

  const pathsToCheck = pathTemplate
    ? [pathTemplate]
    : Array.from(dynamicRoutes);

  logger.debug(
    `matchRouteWithParams: userPath="${userPath}", userSlash=${userSlash}, pathsToCheck: ${pathsToCheck}`,
  );

  const match = pathsToCheck
    .map((template) => {
      const { trimmed: templatePath, endedWithSlash: templateSlash } = trimTrailingSlash(template);

      // Split into segments
      const templateParts = templatePath.split("/");
      const userParts = userPath.split("/");

      const noOptionalParam = !templateParts.some((p) => p.endsWith("?"));

      // If neither route segment uses an optional param, length must match
      if (noOptionalParam && templateParts.length !== userParts.length) {
        return defaultParams;
      }

      // Gather param values
      const params = templateParts.reduce((acc, part, i) => {
        if (part.startsWith(":")) {
          const isOptional = part.endsWith("?");
          const paramName = isOptional
            ? part.slice(1, -1) // strip leading ":" and trailing "?"
            : part.slice(1);   // strip just the leading ":"

          acc[paramName] = userParts[i] || null;
        }
        return acc;
      }, {} as Record<string, string | null>);

      // Ensure each static segment matches
      for (let i = 0; i < templateParts.length; i++) {
        const segment = templateParts[i];

        // Skip param segments
        if (segment.startsWith(":")) {
          // If param is optional but userParts[i] is missing, that’s still okay
          if (!userParts[i] && !segment.endsWith("?")) {
            return defaultParams;
          }
          continue;
        }
        // Must match exactly for static segments
        if (segment !== userParts[i]) {
          return defaultParams;
        }
      }

      // If we get here, we have a match
      const route = appRoutes.get(template);
      const routeParams = params as Record<string, string>;

      // ** Improved trailing-slash check here **
      const mismatch = templateSlash !== userSlash;
      let redir: string | undefined;

      if (mismatch) {
        // If the route template wants a slash (templateSlash === true)
        // but the user did not type one, we add it.
        // Otherwise, remove it.
        const correctedBase = templateSlash
          ? userPath + "/" // add trailing slash
          : userPath;      // or remove trailing slash (already removed above)

        redir = correctedBase + (search ? `?${search}` : "");
      }

      return {
        match: true,
        params: params as Record<string, string>,
        queryParams,
        route,
        routeParams,
        pathTemplate: template,
        needsRedirect: mismatch,
        redirectTo: mismatch ? redir : undefined,
      };
    })
    .find((m) => m.match === true);

  return match ?? defaultParams;
}

type RouterContextType = {
  currentPath: string;
  routeParams: Record<string, string | null>;
  queryParams: Record<string, string | null>;
  navigate: (path: string) => void;
  replace: (path: string) => void;
};

const RouterContext = createContext<RouterContextType>({
  currentPath: "/",
  routeParams: {},
  queryParams: {},
  navigate: () => {},
  replace: () => {},
});

export const useRouter = () => {
  return useContext(RouterContext);
};

export type RouterProviderProps = {
  routeParams: Record<string, string | null>;
  queryParams: Record<string, string | null>;
  initialPath: string;
};

export function addAllRoutes() {
  // We'll store them exactly as declared
  appRoutes.forEach((_value, key) => {
    addRoute(key);
  });
  isographAppRoutes.forEach((_value, key) => {
    addRoute(key);
  });
  logger.debug(
    `Initialized all routes. Registered: ${registeredRoutes.size}, Dynamic: ${dynamicRoutes.size}`,
  );
}

export function RouterProvider(
  {
    routeParams,
    queryParams,
    initialPath,
    children,
  }: React.PropsWithChildren<RouterProviderProps>,
) {
  const [isPending, startTransition] = useTransition();
  const initialState = useMemo(() => ({
    currentPath: initialPath,
    routeParams,
    queryParams,
    NextHeader: null as ComponentWithHeader | null,
  }), [initialPath, routeParams, queryParams]);

  const { posthog } = usePostHog();
  const [state, setState] = useState(initialState);

  const updateState = useCallback((path: string) => {
    const nextMatch = matchRouteWithParams(path);
    setState((prevState) => ({
      ...prevState,
      currentPath: path,
      routeParams: nextMatch.routeParams,
      queryParams: nextMatch.queryParams,
      NextHeader: nextMatch.route?.Component.HeaderComponent ??
        prevState.NextHeader,
    }));
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      logger.debug("Detected browser navigation via popstate.");
      updateState(globalThis.location.pathname);
      // also track a pageview
      if (posthog) {
        posthog.capture("$pageview", {
          path: globalThis.location.pathname,
        });
      }
    };
    globalThis.addEventListener("popstate", handlePopState);
    return () => {
      globalThis.removeEventListener("popstate", handlePopState);
    };
  }, [updateState, posthog]);

  const navigate = (path: string) => {
    startTransition(() => {
      globalThis.history.pushState(null, "", path);
      logger.debug(`Pushing new state to history: ${path}`);
      const nextMatch = matchRouteWithParams(path);
      setState((prevState) => ({
        ...prevState,
        currentPath: path,
        routeParams: nextMatch.routeParams,
        queryParams: nextMatch.queryParams,
        NextHeader: nextMatch.route?.Component.HeaderComponent ??
          prevState.NextHeader,
      }));
      if (posthog) {
        posthog.capture("$pageview", { path });
      }
    });
  };

  const replace = (path: string) => {
    startTransition(() => {
      globalThis.history.replaceState(null, "", path);
      logger.debug(`Replacing state in history: ${path}`);
      const nextMatch = matchRouteWithParams(path);
      setState((prevState) => ({
        ...prevState,
        currentPath: path,
        routeParams: nextMatch.routeParams,
        queryParams: nextMatch.queryParams,
        NextHeader: nextMatch.route?.Component.HeaderComponent ??
          prevState.NextHeader,
      }));
      if (posthog) {
        posthog.capture("$pageview", { path });
      }
    });
  };

  // add all routes to the router context
  addAllRoutes();

  const portalElement = globalThis.document?.querySelector("#staging-root");

  // fix the "NextHeader" re-set to avoid overwriting new route state
  useEffect(() => {
    const NextHeader = state.NextHeader;
    if (NextHeader) {
      const dynamicHeaderTags = globalThis.document?.querySelectorAll(
        "head > .dynamic",
      );
      dynamicHeaderTags?.forEach((tag) => tag.remove());
    }
    if (portalElement) {
      Array.from(portalElement.children).forEach((child) => {
        const clonedChild = child.cloneNode(true);
        document.head.appendChild(clonedChild);
      });
    }
    // Use functional setState to avoid clobbering new route changes
    setState((prevState) => ({
      ...prevState,
      NextHeader: null,
    }));
  }, [state.NextHeader, portalElement]);

  const NextHeader = state.NextHeader;
  return (
    <RouterContext.Provider
      value={{
        ...state,
        navigate,
        replace,
      }}
    >
      {portalElement && NextHeader &&
        createPortal(<NextHeader />, portalElement)}
      {children}
      {isPending && (
        <BfDsFullPageSpinner
          xstyle={{
            backgroundColor: "transparent",
            position: "absolute",
            top: 0,
            left: 0,
          }}
        />
      )}
    </RouterContext.Provider>
  );
}