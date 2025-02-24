import type * as React from "react";
import { RouterLink } from "packages/app/components/Router/RouterLink.tsx";
import { SubpageHeaderTitle } from "packages/app/components/Header/SubpageHeaderTitle.tsx";

type Props = {
  post?: boolean;
};

export function BlogFrame({ children, post }: React.PropsWithChildren<Props>) {
  return (
    <div className="flexRow editor-container">
      <div className="flexColumn left-side-bar">
        <div className="sidebar-header">
          <SubpageHeaderTitle>
            {post
              ? <RouterLink to="/blog">&larr; Blog</RouterLink>
              : <RouterLink to="/blog">Blog</RouterLink>}
          </SubpageHeaderTitle>
        </div>
      </div>
      <div className="flexColumn flex1">
        <div className="current-events-container scrollable">
          {children}
        </div>
      </div>
    </div>
  );
}
