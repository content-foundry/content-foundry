import { BfDsList } from "packages/bfDs/components/BfDsList.tsx";
import { BfDsListItem } from "packages/bfDs/components/BfDsListItem.tsx";
import React from "react";
import { BfDsIcon } from "packages/bfDs/components/BfDsIcon.tsx";
import { classnames } from "lib/classnames.ts";
import { useRouter } from "packages/app/contexts/RouterContext.tsx";
import { useFeatureFlagEnabled } from "packages/app/hooks/useFeatureFlagHooks.ts";

const sidebarRoutes = [
  {
    name: "Formatter",
    rootPath: "formatter",
  },
  {
    name: "Tweet ideator",
    rootPath: "twitter",
  },
  {
    name: "Blog",
    rootPath: "blog",
  },
  {
    name: "FCP subtitles",
    rootPath: "fcp",
  },
  {
    name: "UI",
    rootPath: "ui",
  },
];

export function AppSidebar({ children }: React.PropsWithChildren) {
  const { currentPath, navigate } = useRouter();
  const [showSidebar, setShowSidebar] = React.useState(false);
  const enableSidebar = useFeatureFlagEnabled("enable_sidebar")
  if (!enableSidebar) {
    return children;
  }

  const appSidebarClasses = classnames([
    "AppSidebar",
    "dark",
    {
      active: showSidebar,
    },
  ]);

  // e.g. "/twitter/voice" -> "twitter"
  const pathForHighlighting = currentPath.split("/")[1];

  return (
    <div className="App">
      <div className={appSidebarClasses}>
        <div
          className="sidebarButton"
          onClick={() => setShowSidebar(!showSidebar)}
        >
          <BfDsIcon
            name={showSidebar ? "sidebarClose" : "sidebarOpen"}
            color="var(--alwaysLight)"
          />
        </div>
        <BfDsList>
          {sidebarRoutes.map((route) => (
            <BfDsListItem
              content={route.name}
              key={route.rootPath}
              isHighlighted={pathForHighlighting === route.rootPath}
              onClick={() => navigate(`/${route.rootPath}`)}
            />
          ))}
        </BfDsList>
      </div>
      <div className="AppContent">{children}</div>
    </div>
  );
}
