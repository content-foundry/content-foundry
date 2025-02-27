import * as React from "react";
import { classnames } from "lib/classnames.ts";
import { BfDsIcon } from "packages/bfDs/components/BfDsIcon.tsx";
import { BfDsListItem } from "packages/bfDs/components/BfDsListItem.tsx";
import { getLogger } from "packages/logger.ts";
const logger = getLogger(import.meta);
const BfError = Error;

type Props = {
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  header?: string;
  separator?: boolean;
};

export function BfDsList(
  { children, collapsible, defaultCollapsed, header, separator }:
    React.PropsWithChildren<Props>,
) {
  const [collapsed, setCollapsed] = React.useState(defaultCollapsed ?? false);
  if (collapsible && !header) {
    throw new BfError(
      "BfDsList: A header is required when collapsible is true.",
    );
  }
  if (defaultCollapsed && !collapsible) {
    throw new BfError(
      "BfDsList: defaultCollapsed can only be used when colllapsible is true.",
    );
  }

  const listClasses = classnames([
    "list",
    { bottomSeparator: separator },
  ]);

  const expandClasses = classnames([
    "list-expandIcon",
    { collapsed },
  ]);

  const showContent = collapsible ? !collapsed : true;

  return (
    <div className={listClasses}>
      {header && (
        <div className="list-header">
          <div className="list-header-title">{header}</div>
          {collapsible && (
            <div
              className="list-header-toggle"
              onClick={() => setCollapsed(!collapsed)}
            >
              <div className={expandClasses}>
                <BfDsIcon name="arrowDown" />
              </div>
            </div>
          )}
        </div>
      )}
      {showContent && children}
    </div>
  );
}

export function Example() {
  return (
    <div className="flexColumn gapLarge">
      <BfDsList header="List header">
        <BfDsListItem content="Item 1" />
        <BfDsListItem content="Item 2" expandedContent="Item 2 more content" />
        <BfDsListItem content="Item 3" iconRight="home" />
        <BfDsListItem
          content="Item 4 clickable"
          onClick={() => logger.log("clicked")}
        />
        <BfDsListItem
          content="Item 5"
          isHighlighted
          footer="Footer"
          toggle={() => logger.log("toggled")}
        />
      </BfDsList>
      <BfDsList header="List with separators" separator>
        <BfDsListItem content="Item 1" />
        <BfDsListItem content="Item 2" />
        <BfDsListItem content="Item 3" />
      </BfDsList>
      <BfDsList header="Collapsible" collapsible>
        <BfDsListItem content="Item 1" />
        <BfDsListItem content="Item 2" />
        <BfDsListItem content="Item 3" />
      </BfDsList>
      <BfDsList
        header="Default collapsed"
        collapsible
        defaultCollapsed
      >
        <BfDsListItem content="Item 1" />
        <BfDsListItem content="Item 2" />
        <BfDsListItem content="Item 3" />
      </BfDsList>
    </div>
  );
}
