import * as React from "react";
import { hydrateRoot } from "react-dom/client";
import { getLogger } from "packages/logger.ts";

const logger = getLogger(import.meta);
type JupyterProps = unknown;

function rehydrate(props: JupyterProps) {
  const root = document.querySelector("#root");

  // @ts-expect-error This gets added at build time
  logger.debug(MainComponent);
  // @ts-expect-error This gets added at build time
  if (!MainComponent) {
    logger.error(
      "Couldn't find MainComponent... should have been added right before building.",
    );
  }
  if (root) {
    // @ts-expect-error This gets added at build time
    hydrateRoot(root, React.createElement(MainComponent, props));
  } else {
    logger.error("No root element found");
  }

  return Promise.resolve();
}

// @ts-expect-error Still haven't added types here
globalThis.__REHYDRATE__ = rehydrate;
