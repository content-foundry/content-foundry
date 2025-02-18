{
  description = "Nix flake referencing replit.nix";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-24.11";
  };

  outputs = { self, nixpkgs, ... }:
    let
      system = "x86_64-linux";
      pkgs = import nixpkgs { inherit system; };
      replit = import ./replit.nix { inherit pkgs; };
    in
    {
      devShells.${system}.default = pkgs.mkShell {
        buildInputs = [ pkgs.git ] ++ replit.deps;
      };
    };
}