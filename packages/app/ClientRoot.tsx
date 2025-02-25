import {
  AppEnvironmentProvider,
  type ServerProps,
} from "packages/app/contexts/AppEnvironmentContext.tsx";
import { AppRoot } from "packages/app/AppRoot.tsx";
import { hydrateRoot } from "react-dom/client";
import { BfDsProvider } from "packages/bfDs/contexts/BfDsContext.tsx";
import { ErrorBoundary } from "packages/app/components/ErrorBoundary.tsx";
import { getLogger } from "packages/logger.ts";
import { AppSidebar } from "packages/app/components/AppSidebar.tsx";
const logger = getLogger(import.meta);

export function ClientRoot(
  {
    children,
    ...appEnvironment
  }: React.PropsWithChildren<ServerProps>,
) {
  return (
    <BfDsProvider>
      <ErrorBoundary>
        <AppEnvironmentProvider {...appEnvironment}>
          {/* I know this is the wrong place... wip */}
          <AppSidebar>
            {children}
          </AppSidebar>
        </AppEnvironmentProvider>
      </ErrorBoundary>
    </BfDsProvider>
  );
}

export function rehydrate(props: ServerProps) {
  const root = document.querySelector("#root");
  if (root) {
    logger.debug("rehydrating root", root, props);
    hydrateRoot(
      root,
      <ClientRoot {...props}>
        <AppRoot />
      </ClientRoot>,
    );
    logger.debug("rehydrated root?", root);
  } else {
    logger.error("couldn't rehydrate, root not found");
  }
}
logger.debug("AppRoot loaded");
// @ts-expect-error Not typed on the window yet
if (globalThis.__ENVIRONMENT__) {
  logger.debug("found environment, rehydrating root");
  // @ts-expect-error Not typed on the window yet
  rehydrate(globalThis.__ENVIRONMENT__);
} else {
  logger.debug("Setting rehydration callback");
  // @ts-expect-error Not typed on the window yet
  globalThis.__REHYDRATE__ = rehydrate;
}
