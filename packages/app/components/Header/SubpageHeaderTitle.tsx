import { CfLogo } from "packages/bfDs/static/CfLogo.tsx";

export function SubpageHeaderTitle({ children }: React.PropsWithChildren) {
  return (
    <h1 className="tools-h1">
      <div className="tools-logo">
        <CfLogo
          boltColor="var(--textSecondary)"
          foundryColor="var(--textSecondary)"
        />
      </div>
      {children}
    </h1>
  );
}
