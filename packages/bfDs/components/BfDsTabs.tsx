import * as React from "react";

const { useEffect, useState } = React;

export type Tab = {
  name: string;
  count?: number;
  hidden?: boolean;
  testId?: string; // for identifying the tab in posthog
};
type Props = {
  tabs: Tab[];
  onTabSelected: (tabName: string) => void;
};

const styles: Record<string, React.CSSProperties> = {
  container: {},
  tabs: {
    display: "flex",
    flexDirection: "row",
  },
  tab: {
    padding: "16px 24px 12px",
    fontSize: 16,
    color: "var(--textSecondary)",
    cursor: "pointer",
    borderBottomWidth: 4,
    borderBottomStyle: "solid",
    borderBottomColor: "transparent",
  },
  tabSelected: {
    color: "var(--text)",
    borderBottomColor: "var(--secondaryColor)",
  },
  tabHover: {
    color: "var(--text)",
  },
  tabNumber: {
    opacity: 0.5,
    fontSize: "0.8em",
  },
};

export function BfDsTabs({ tabs, onTabSelected }: Props) {
  const [selectedTabName, setSelectedTabName] = useState<string>(tabs[0].name);
  const [hoveredTab, setHoveredTab] = useState<number | null>(null);

  if (!tabs || tabs.length === 0) {
    return null;
  }

  useEffect(() => {
    onTabSelected(selectedTabName);
  }, [selectedTabName]);

  return (
    <div style={styles.container}>
      <div style={styles.tabs}>
        {tabs.map((tab, index) => {
          if (tab.hidden === true) return null;
          return (
            <div
              key={index}
              style={{
                ...styles.tab,
                ...(hoveredTab === index && styles.tabHover),
                ...(selectedTabName === tab.name && styles.tabSelected),
              }}
              onClick={() => setSelectedTabName(tab.name)}
              onMouseEnter={() => setHoveredTab(index)}
              onMouseLeave={() => setHoveredTab(null)}
              data-bf-testid={tab.testId ?? `tab-${tab.name.toLowerCase()}`}
            >
              {tab.name}
              {Number(tab.count) > 0 && (
                <span style={styles.tabNumber}>{tab.count}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
