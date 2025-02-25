import { BfDsList } from "packages/bfDs/components/BfDsList.tsx";
import { BfDsListItem } from "packages/bfDs/components/BfDsListItem.tsx";
import React from "react";
import { BfDsIcon } from "packages/bfDs/components/BfDsIcon.tsx";
import { classnames } from "lib/classnames.ts";
import { useRouter } from "packages/app/contexts/RouterContext.tsx";

const sidebarRoutes = [
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
