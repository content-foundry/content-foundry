import { useState } from "react";
import { BfDsListItem } from "packages/bfDs/components/BfDsListItem.tsx";
import { BfDsList } from "packages/bfDs/components/BfDsList.tsx";

import { ColorsAndFonts } from "packages/bfDs/demo/ColorsAndFonts.tsx";
import { Example as ExampleBreadcrumb } from "packages/bfDs/components/BfDsBreadcrumbs.tsx";
import { Example as ExampleCallout } from "packages/bfDs/components/BfDsCallout.tsx";
import { Example as ExampleDropzone } from "packages/bfDs/components/BfDsDropzone.tsx";
import { Example as ExampleTable } from "packages/bfDs/components/BfDsTable.tsx";
import { Example as ExampleToast } from "packages/bfDs/components/BfDsToast.tsx";
import { Example as ExampleTodos } from "packages/bfDs/components/BfDsTodos.tsx";
import { Example as ExampleList } from "packages/bfDs/components/BfDsList.tsx";
import { Example as ExampleModal } from "packages/bfDs/components/BfDsModal.tsx";
import { Example as ExamplePill } from "packages/bfDs/components/BfDsPill.tsx";
import { Example as ExampleSheet } from "packages/bfDs/components/BfDsSheet.tsx";
import { Demo as GlimmerDemo } from "packages/bfDs/components/BfDsGlimmer.tsx";
import { Buttons } from "packages/bfDs/demo/Buttons.tsx";
import { RouterLink } from "packages/app/components/Router/RouterLink.tsx";
import { Form } from "packages/bfDs/components/demo/Form.tsx";
import { IconDemo } from "packages/bfDs/components/BfDsIcon.tsx";
import { Tooltips } from "packages/bfDs/components/demo/Tooltips.tsx";
import { getLogger } from "packages/logger.ts";
const _logger = getLogger(import.meta);

type DemoData = {
  name: string;
  component: React.ReactNode;
};
const demoData: Array<DemoData> = [
  {
    name: "Colors and fonts",
    component: <ColorsAndFonts />,
  },
  {
    name: "Breadcrumbs",
    component: (
      <div className="ui-section">
        <h2>Breadcrumbs</h2>
        <ExampleBreadcrumb />
      </div>
    ),
  },
  {
    name: "Buttons",
    component: <Buttons />,
  },
  {
    name: "Callouts",
    component: (
      <div className="ui-section">
        <h2>Callouts</h2>
        <ExampleCallout />
      </div>
    ),
  },
  {
    name: "Dropzone",
    component: (
      <div className="ui-section">
        <h2>Dropzone</h2>
        <ExampleDropzone />
      </div>
    ),
  },
  {
    name: "Forms",
    component: <Form />,
  },
  {
    name: "Glimmers",
    component: (
      <div className="ui-section">
        <h2>Glimmers</h2>
        <GlimmerDemo />
      </div>
    ),
  },
  {
    name: "Icons",
    component: (
      <div className="ui-section">
        <h2>Icons</h2>
        <IconDemo />
      </div>
    ),
  },
  {
    name: "Lists",
    component: (
      <div className="ui-section">
        <h2>Lists</h2>
        <ExampleList />
      </div>
    ),
  },
  {
    name: "Modals",
    component: (
      <div className="ui-section">
        <h2>Modals</h2>
        <ExampleModal />
      </div>
    ),
  },
  {
    name: "Pills",
    component: (
      <div>
        <div className="ui-section">
          <h2>Pills</h2>
          <ExamplePill />
        </div>
      </div>
    ),
  },
  {
    name: "Sheet",
    component: <ExampleSheet />,
  },
  {
    name: "Tables",
    component: (
      <div className="ui-section">
        <h2>Tables</h2>
        <ExampleTable />
      </div>
    ),
  },
  {
    name: "Toasts",
    component: (
      <div className="ui-section">
        <h2>Toasts</h2>
        <ExampleToast />
      </div>
    ),
  },
  {
    name: "Todos",
    component: (
      <div className="ui-section">
        <ExampleTodos />
      </div>
    ),
  },
  {
    name: "Tooltips",
    component: <Tooltips />,
  },
  //   {
  //     name: "Kitchen sink",
  //     component: <KitchenSink />,
  //   },
];

export function PageUIDemo() {
  const [tab, setTab] = useState(1);

  const demoComponent = demoData[tab]?.component ?? (
    <div>Pick one from the sidebar</div>
  );

  return (
    <div className="ui flexRow">
      <div className="ui-sidebar">
        <RouterLink to="/">Home</RouterLink>
        <h1>Demo</h1>
        <BfDsList>
          {demoData.map((demo, index) => (
            <BfDsListItem
              content={demo.name}
              isHighlighted={index === tab}
              onClick={() => setTab(index)}
              key={demo.name}
            />
          ))}
        </BfDsList>
      </div>
      <div className="ui-content">
        {demoComponent}
      </div>
    </div>
  );
}
