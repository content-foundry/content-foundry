import type * as React from "react";
import type { ExtractReadFromStore, FragmentReference } from "@isograph/react";
import { useResult } from "@isograph/react";
import { getLogger } from "packages/logger.ts";
import { BfError } from "packages/BfError.ts";
import type { RouteEntrypoint } from "packages/app/__generated__/builtRoutes.ts";
import type { BfIsographEntrypoint } from "lib/BfIsographEntrypoint.ts";

const _logger = getLogger(import.meta);

type NetworkRequestReaderOptions = {
  suspendIfInFlight: boolean;
  throwOnNetworkError: boolean;
};

export function BfIsographFragmentReader<
  TEntrypoint extends BfIsographEntrypoint,
>(
  props: {
    fragmentReference: FragmentReference<
      ExtractReadFromStore<TEntrypoint>,
      RouteEntrypoint
    >;
    networkRequestOptions?: Partial<NetworkRequestReaderOptions>;
    additionalProps?: Record<string, unknown>;
  },
): React.ReactNode {
  const { Body } = useResult(
    props.fragmentReference,
    props.networkRequestOptions,
  );

  if (!Body) {
    throw new BfError("Couldn't load a valid component");
  }

  return <Body {...props.additionalProps} />;
}
