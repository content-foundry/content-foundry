{
  description = "Nix flake referencing replit.nix for dev environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-24.11";
  };

  outputs = { self, nixpkgs, ... }:
    let
      # You can change this system to "aarch64-darwin" for Apple Silicon, etc.
      system = "x86_64-linux";

      # Import the chosen nixpkgs channel
      pkgs = import nixpkgs { inherit system; };

      # Re-use your replit.nix
      # (which must be a function: { pkgs }: { deps = [ ... ]; })
      replit = import ./replit.nix { inherit pkgs; };
    in
    {
      # A dev shell that includes everything from replit.nix
      devShells.${system}.default = pkgs.mkShell {
        packages = replit.deps;
      };

      # (Optional) Provide a default package build, or other outputs
      # packages.${system}.default = pkgs.stdenv.mkDerivation {
      #   name = "example-derivation";
      #   src = ./.;
      #   buildCommand = ''
      #     echo "No build steps, just a placeholder"
      #   '';
      # };
    }
}