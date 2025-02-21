{ pkgs }:
let
  unstablePkgs = import (builtins.fetchTarball {
    url = "https://github.com/NixOS/nixpkgs/archive/0141b8e1af43116e0a9d7cfbd0419a31aa62b4f2.tar.gz";
    sha256 = "0bilcymkixm0ar3c4gbr8jciq2zfxx28l31y6wmsnbx1j5n6kiv5";
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