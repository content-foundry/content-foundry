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

export const registeredRoutes = new Set<string>();
export const dynamicRoutes = new Set<string>();

/**
 * @example
 * addRoute("/projects/:projectId?");
 * addRoute("/projects");
 * addRoute("/")
 * addRoute("/signup/:plan?")
 */
function addRoute(path: string) {
  let routePath = path;
  if (routePath.includes(":")) {
    dynamicRoutes.add(path);
    routePath = routePath.split(":")[0];
  }
  if (routePath.endsWith("/")) {
    routePath = routePath.slice(0, -1);
  }
  registeredRoutes.add(routePath);
}

export function addAllRoutes() {
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

type MatchedRoute = {
  match: boolean;
  params: Record<string, string>;
  queryParams: Record<string, string>;
  routeParams: Record<string, string>;
  route?: RouteGuts;
  pathTemplate: string;
};

export function matchRouteWithParams(
  pathRaw = "",
  pathTemplate?: string,
): MatchedRoute {
  const [path, search] = pathRaw.split("?");
  const searchParams = new URLSearchParams(search);
  const queryParams = Object.fromEntries(searchParams.entries());
  const defaultParams = {
    match: false,
    params: {},
    queryParams,
    route: appRoutes.get(path),
    routeParams: {},
    pathTemplate: pathTemplate ?? path,
  };
  const pathsToMatch = pathTemplate ? [pathTemplate] : Array(...dynamicRoutes);
  logger.debug(
    `matchRouteWithParams: path: ${path}, pathsToMatch: ${pathsToMatch}`,
  );

  const match = pathsToMatch.map((pathTemplate) => {
    logger.debug(`matchRouteWithParams: pathTemplate: ${pathTemplate}`);
    const pathTemplateParts = pathTemplate.split("/");
    const currentPathParts = path.split("/");

    // Check if path parts length matches (accounting for optional parameters)
    if (
      !pathTemplateParts.some((p) => p.endsWith("?")) &&
      pathTemplateParts.length !== currentPathParts.length
    ) {
      return defaultParams;
    }

    const params = pathTemplateParts.reduce((acc, part, i) => {
      if (part.startsWith(":")) {
        const paramName = part.endsWith("?")
          ? part.slice(1, -1)
          : part.slice(1);
        acc[paramName] = currentPathParts[i] || null;
      }
      return acc;
    }, {} as Record<string, string | null>);

    logger.debug("params before checking match:", params);

    for (let i = 0; i < pathTemplateParts.length; i++) {
      // Skip if part is a parameter
      if (pathTemplateParts[i].startsWith(":")) {
        if (!currentPathParts[i] && !pathTemplateParts[i].endsWith("?")) {
          return defaultParams;
        }
        logger.debug(
          "part is a parameter",
          pathTemplateParts[i],
          currentPathParts[i] ?? "undefined",
        );
      } else if (pathTemplateParts[i] !== currentPathParts[i]) {
        logger.debug(
          "part mismatch",
          pathTemplateParts[i],
          currentPathParts[i],
        );
        return defaultParams;
      }
    }

    const route = appRoutes.get(pathTemplate);
    return {
      match: true,
      params,
      route,
      queryParams,
      routeParams: params,
      pathTemplate,
    };
  }).find((route) => route.match === true);

  logger.debug("match result:", match);
  return match ?? defaultParams;
}

type RouterContextType = {
  currentPath: string;
  routeParams: Record<string, string | null>;
  queryParams: Record<string, string | null>;
  navigate: (path: string) => void;
};

const RouterContext = createContext<RouterContextType>({
  currentPath: "/",
  routeParams: {},
  queryParams: {},
  navigate: () => {},
});

export const useRouter = () => {
  return useContext(RouterContext);
};

export type RouterProviderProps = {
  routeParams: Record<string, string | null>;
  queryParams: Record<string, string | null>;
  initialPath: string;
};

export function RouterProvider(
  { routeParams, queryParams, initialPath, children }: React.PropsWithChildren<
    RouterProviderProps
  >,
) {
  const [isPending, startTransition] = useTransition();
  const initialState = useMemo(() => ({
    currentPath: initialPath,
    routeParams,
    queryParams,
    NextHeader: null as ComponentWithHeader | null,
  }), [initialPath, routeParams, queryParams]);

  const [state, setState] = useState(initialState);

  const updateState = useCallback((path: string) => {
    const nextMatch = matchRouteWithParams(path);
    const NextHeader = nextMatch.route?.Component.HeaderComponent;
    setState({
      currentPath: path,
      routeParams: nextMatch.routeParams,
      queryParams: nextMatch.queryParams,
      NextHeader: NextHeader ?? state.NextHeader,
    });
  }, [setState]);

  useEffect(() => {
    const handlePopState = () => {
      logger.debug("Detected browser navigation via popstate.");
      updateState(globalThis.location.pathname);
    };
    globalThis.addEventListener("popstate", handlePopState);
    return () => {
      globalThis.removeEventListener("popstate", handlePopState);
    };
  }, [updateState]);

  const navigate = (path: string) => {
    startTransition(() => {
      globalThis.history.pushState(null, "", path);
      logger.debug(`Pushing new state to history: ${path}`);
      updateState(path);
    });
  };

  // add all routes to the router context
  addAllRoutes();

  const portalElement = globalThis.document?.querySelector("#staging-root");
  useEffect(() => {
    const NextHeader = state.NextHeader;
    if (NextHeader) {
      const dynamicHeaderTags = globalThis.document?.querySelectorAll(
        "head > .dynamic",
      );
      dynamicHeaderTags.forEach((tag) => tag.remove());
    }
    if (portalElement) {
      Array.from(portalElement.children).forEach((child) => {
        const clonedChild = child.cloneNode(true);
        document.head.appendChild(clonedChild);
      });
    }
    setState({ ...state, NextHeader: null });
  }, [state.NextHeader]);

  const NextHeader = state.NextHeader;
  return (
    <RouterContext.Provider
      value={{
        ...state,
        navigate,
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
