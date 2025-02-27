import { useState } from "react";

import { BfDsButton } from "packages/bfDs/components/BfDsButton.tsx";
import { BfDsInput } from "packages/bfDs/components/BfDsInput.tsx";
import { BfDsSpinner } from "packages/bfDs/components/BfDsSpinner.tsx";

export function KitchenSink() {
  const [percent, setPercent] = useState<string>("65");
  return (
    <div className="ui-section">
      <h2>Random</h2>
      <div>
        <BfDsSpinner waitIcon />
        {/* <WorkflowStatusIndicator percent={Number(percent)} /> */}
        <div>
          <BfDsButton
            text="Progress button"
            kind="primary"
            progress={Number(percent)}
          />
          <BfDsButton
            iconLeft="download"
            kind="primary"
            progress={Number(percent)}
          />
        </div>
        <BfDsInput
          label="Percent"
          value={percent}
          type="number"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setPercent(e.target.value)}
          style={{ width: 100 }}
        />
      </div>
    </div>
  );
}
