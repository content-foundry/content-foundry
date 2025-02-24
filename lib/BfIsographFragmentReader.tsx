import type * as React from "react";
import type { ExtractReadFromStore, IsographEntrypoint } from "@isograph/react";
import type { FragmentReference } from "@isograph/react";
// import { NetworkRequestReaderOptions } from '@isograph/react';
import { useResult } from "@isograph/react";
import { getLogger } from "packages/logger.ts";
import { BfError } from "packages/BfError.ts";
import type { RouteEntrypoint } from "packages/app/__generated__/builtRoutes.ts";

const _logger = getLogger(import.meta);

type NetworkRequestReaderOptions = {
  suspendIfInFlight: boolean;
  throwOnNetworkError: boolean;
};

export function BfIsographFragmentReader<
  // deno-lint-ignore no-explicit-any
  TEntrypoint extends IsographEntrypoint<any, RouteEntrypoint>,
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
