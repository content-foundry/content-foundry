{ pkgs }:
let
  unstablePkgs = import (builtins.fetchTarball {
    url = "https://github.com/NixOS/nixpkgs/archive/482ffc541c8ffb8d2d09018dba09667d8d2e5e7f.tar.gz";
    sha256 = "1wvj6dl9y5gp3xb8vqlg625xi0ci4gj9zmg52qmz0hyj4rgh1mv7";
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