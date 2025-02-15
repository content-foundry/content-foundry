import {
  RouterProvider,
  type RouterProviderProps,
} from "packages/app/contexts/RouterContext.tsx";
// import clientEnvironment from "packages/client/relay/relayEnvironment.ts";
// import AppStateProvider from "packages/client/contexts/AppStateContext.tsx";
// import { featureFlags, featureVariants } from "packages/features/list.ts";
// import { posthog } from "posthog-js";
// import { PostHogProvider } from "posthog-js/react"

// import { RelayEnvironmentProvider } from "react-relay";
import * as React from "react";
import {
  type IsographEnvironment,
  IsographEnvironmentProvider,
} from "@isograph/react";
// import type { Environment } from "relay-runtime";
import { getEnvironment } from "packages/app/isographEnvironment.ts";
import { getLogger } from "packages/logger.ts";

const logger = getLogger(import.meta);

const AppEnvironmentContext = React.createContext<AppEnvironmentProps>({
  posthogKey: "",
});

export type AppEnvironmentProps = {
  posthogKey: string;
};

export type ServerProps = AppEnvironmentProps & RouterProviderProps & {
  IS_SERVER_RENDERING: boolean;
  isographServerEnvironment: IsographEnvironment;
};

export function useAppEnvironment() {
  return React.useContext<AppEnvironmentProps>(AppEnvironmentContext);
}

// let posthogClient;

export function AppEnvironmentProvider(
  {
    children,
    routeParams,
    queryParams,
    initialPath,
    isographServerEnvironment,
    ...appEnvironment
  }: React.PropsWithChildren<ServerProps>,
) {
  // const { posthogKey } = appEnvironment;
  const isographEnvironment = isographServerEnvironment ??
    getEnvironment();
  // const currentViewerId = props.currentViewer?.id;
  // React.useEffect(() => {
  //   if (currentViewerId) {
  //     identifyPerson(currentViewerId);
  //   }
  // }, [currentViewerId]);
  logger.debug("AppEnvironmentProvider: props", routeParams, queryParams);
  logger.debug(
    isographEnvironment,
    isographServerEnvironment,
    IsographEnvironmentProvider,
  );

  // posthogClient = useMemo(() => {
  //   return posthog.init(posthogKey);
  // }, [posthogKey]);

  return (
    <AppEnvironmentContext.Provider value={appEnvironment}>
      <IsographEnvironmentProvider environment={isographEnvironment}>
        {/* <PostHogProvider client={posthogClient}> */}
        <RouterProvider
          routeParams={routeParams}
          queryParams={queryParams}
          initialPath={initialPath}
        >
          {children}
        </RouterProvider>
        {/* </PostHogProvider> */}
      </IsographEnvironmentProvider>
    </AppEnvironmentContext.Provider>
  );
}
