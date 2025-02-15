export function getConfigurationVariable(
  configVar: string,
): string | undefined {
  let returnable = undefined;
  if (typeof Deno === "undefined") {
    // @ts-expect-error global environment variables
    returnable = globalThis.__ENVIRONMENT__?.[configVar];
  } else {
    returnable = Deno.env.get(configVar);
  }
  if (returnable == "") {
    return undefined;
  }
  return returnable;
}
