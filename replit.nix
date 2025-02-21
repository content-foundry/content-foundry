{ pkgs }:
let
  unstablePkgs = import (builtins.fetchTarball {
    url = "https://github.com/NixOS/nixpkgs/archive/0141b8e1af43116e0a9d7cfbd0419a31aa62b4f2.tar.gz";
  }) { };
in
{
  deps = [
    pkgs.unzip
    pkgs.jupyter
    pkgs.jq
    pkgs.sapling
    pkgs.gh
    pkgs.python311Packages.tiktoken
    unstablePkgs.deno
  ];
}