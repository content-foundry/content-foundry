import { runShellCommand } from "infra/bff/shellBase.ts";
import { register } from "infra/bff/bff.ts";

export function buildNix(profile = "."): Promise<number> {
  return runShellCommand([
    "nix",
    "build",
    profile,
    "--out-link",
    "nix_system",
  ]);
}

register("nix", "Builds the current nix system using flake.nix", () => {
  return buildNix();
});

register(
  "nix:deploy",
  "Builds the current nix system using flake.nix with only deployment packages",
  () => {
    return buildNix(".#deploy");
  },
);
