import { CfLogo } from "packages/bfDs/static/CfLogo.tsx";
import { RouterLink } from "packages/app/components/Router/RouterLink.tsx";

export function SubpageHeaderTitle({ children }: React.PropsWithChildren) {
  return (
    <h1 className="tools-h1">
      <div className="tools-logo">
        <RouterLink to="/">
          <CfLogo
            boltColor="var(--textSecondary)"
            foundryColor="var(--textSecondary)"
          />
        </RouterLink>
      </div>
      {children}
    </h1>
  );
}
