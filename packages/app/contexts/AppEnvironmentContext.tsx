import {
  RouterProvider,
  type RouterProviderProps,
} from "packages/app/contexts/RouterContext.tsx";
// import clientEnvironment from "packages/client/relay/relayEnvironment.ts";
// import AppStateProvider from "packages/client/contexts/AppStateContext.tsx";
// import { featureFlags, featureVariants } from "packages/features/list.ts";

import { PostHogProvider } from "posthog-js/react";

// import { RelayEnvironmentProvider } from "react-relay";
import * as React from "react";
import {
  type IsographEnvironment,
  IsographEnvironmentProvider,
} from "@isograph/react";
// import type { Environment } from "relay-runtime";
import { getEnvironment } from "packages/app/isographEnvironment.ts";
import { getLogger } from "packages/logger.ts";
import { getCurrentClients } from "lib/posthog.ts";

const logger = getLogger(import.meta);

const AppEnvironmentContext = React.createContext<AppEnvironmentProps>({});

export type AppEnvironmentProps = {
  POSTHOG_API_KEY?: string;
  personBfGid?: string;
  featureFlags?: Record<string, string | boolean>;
};

export type ServerProps =
  & AppEnvironmentProps
  & RouterProviderProps
  & {
    IS_SERVER_RENDERING: boolean;
    isographServerEnvironment: IsographEnvironment;
  };

export function useAppEnvironment() {
  return React.useContext<AppEnvironmentProps>(AppEnvironmentContext);
}

export function AppEnvironmentProvider(
  {
    children,
    routeParams,
    queryParams,
    initialPath,
    isographServerEnvironment,
    personBfGid,
    ...appEnvironment
  }: React.PropsWithChildren<ServerProps>,
) {
  const isographEnvironment = isographServerEnvironment ?? getEnvironment();

  logger.debug("AppEnvironmentProvider: props", routeParams, queryParams);
  logger.debug(
    isographEnvironment,
    isographServerEnvironment,
    IsographEnvironmentProvider,
  );
  const { frontendClient, backendClient } = React.useMemo(getCurrentClients, [
    personBfGid,
  ]);
  const posthog = frontendClient ?? backendClient;

  return (
    <AppEnvironmentContext.Provider value={appEnvironment}>
      <PostHogProvider client={posthog}>
        <IsographEnvironmentProvider environment={isographEnvironment}>
          <RouterProvider
            routeParams={routeParams}
            queryParams={queryParams}
            initialPath={initialPath}
          >
            {children}
          </RouterProvider>
        </IsographEnvironmentProvider>
      </PostHogProvider>
    </AppEnvironmentContext.Provider>
  );
}
