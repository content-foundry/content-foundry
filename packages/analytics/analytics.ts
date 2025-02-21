import type { PostHog } from "posthog-js";
import type { PostHog as PostHogNode } from "posthog-node";
import { getLogger } from "packages/logger.ts";
import { BfError } from "packages/BfError.ts";
import { getConfigurationVariable } from "packages/getConfigurationVariable.ts";

const logger = getLogger(import.meta);

let frontendClient: PostHog | undefined;
let backendClient: PostHogNode | undefined;

function isBrowser() {
  return typeof Deno === "undefined";
}

export async function startupBackend() {
  if (isBrowser()) {
    throw new BfError("Can't start up backend in browser");
  }
  const POSTHOG_API_KEY = getConfigurationVariable("POSTHOG_API_KEY");
  const POSTHOG_HOST = getConfigurationVariable("POSTHOG_HOST") ??
    "https://app.posthog.com";

  if (!POSTHOG_API_KEY) {
    logger.warn("No PostHog API key found for backend initialization");
    return { backendClient: undefined };
  }

  const { PostHog } = await import("posthog-node");
  backendClient = new PostHog(POSTHOG_API_KEY, {
    host: POSTHOG_HOST,
    flushAt: 1,
    flushInterval: 0,
  });
  return { backendClient };
}

export function getCurrentClients() {
  return { frontendClient, backendClient };
}

export async function ensurePosthogClientIsSetUp(
  distinctID?: string,
  // deno-lint-ignore no-explicit-any
  featureFlagsBootstrap?: any,
): Promise<{
  frontendClient?: PostHog;
  backendClient?: PostHogNode;
}> {
  if (frontendClient || backendClient) {
    return { frontendClient, backendClient };
  }

  if (isBrowser()) {
    const POSTHOG_API_KEY = getConfigurationVariable("POSTHOG_API_KEY");
    const POSTHOG_HOST = getConfigurationVariable("POSTHOG_HOST") ??
      "https://app.posthog.com";

    if (!POSTHOG_API_KEY) {
      logger.warn("No PostHog API key found for frontend initialization");
      return {};
    }

    const { posthog } = (await import("posthog-js")).default;
    frontendClient = posthog.init(POSTHOG_API_KEY, {
      api_host: POSTHOG_HOST,
      bootstrap: featureFlagsBootstrap,
      loaded: (loadedPostHog) => {
        if (distinctID) {
          loadedPostHog.identify(distinctID);
        }
      },
    });
    return { frontendClient };
  }

  return await startupBackend();
}

function getBfGraphId(personId: string): string {
  return personId.startsWith("Person") ? personId.split(":")[1] : personId;
}

export async function captureEvent(
  eventObject: string,
  eventVerb: string,
  properties?: Record<string, unknown>,
  personBfGraphId?: string,
) {
  const { backendClient, frontendClient } = await ensurePosthogClientIsSetUp();
  logger.debug("Capturing event", {
    eventObject,
    eventVerb,
    properties,
    personBfGraphId,
  });

  const eventName = `${eventObject} ${eventVerb}`;

  if (backendClient && personBfGraphId) {
    backendClient.capture({
      distinctId: personBfGraphId,
      event: eventName,
      properties,
    });
    logger.debug("Backend captured event", {
      eventObject,
      eventVerb,
      properties,
    });
  }

  if (frontendClient) {
    let bfGraphId = personBfGraphId;
    if (personBfGraphId?.startsWith("Person")) {
      bfGraphId = getBfGraphId(personBfGraphId);
    }
    if (bfGraphId) {
      frontendClient.identify(bfGraphId);
    }
    frontendClient.capture(eventName, properties);
    logger.debug("Frontend captured event", {
      eventObject,
      eventVerb,
      properties,
    });
  }
}

export async function identifyPerson(id?: string) {
  if (!id) return;

  const { backendClient, frontendClient } = await ensurePosthogClientIsSetUp();

  if (frontendClient) {
    const personBfGraphId = getBfGraphId(id);
    return frontendClient.identify(personBfGraphId);
  } else if (backendClient) {
    logger.warn("Tried to identify a person on the backend");
    return;
  }
  logger.error("Tried to identify a person but no client was set up");
}

export async function updatePersonProperties(
  personBfGraphId: string,
  properties: Record<string, unknown>,
) {
  const { backendClient, frontendClient } = await ensurePosthogClientIsSetUp();

  if (frontendClient) {
    logger.debug("Tried to update a person on the frontend");
    return;
  } else if (backendClient) {
    return backendClient.identify({
      distinctId: personBfGraphId,
      properties,
    });
  }
  logger.error("Tried to update a person but no client was set up");
}

export async function capturePageview(location?: string) {
  const { backendClient, frontendClient } = await ensurePosthogClientIsSetUp();

  if (frontendClient) {
    return frontendClient.capture(
      "$pageview",
      location ? { location } : undefined,
    );
  } else if (backendClient) {
    logger.debug("Tried to capture a pageview on the backend");
    return;
  }
  logger.error("Tried to capture a pageview but no client was set up");
}
