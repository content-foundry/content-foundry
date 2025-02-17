import { useState } from "react";
import { BfDsButton } from "packages/bfDs/components/BfDsButton.tsx";
export function ExampleComponent({ complexObject, complexMap }) {
  const [val, setVal] = useState(
    complexObject?.lol?.initialValue ?? complexMap?.get("lol") ?? 0,
  );
  return (
    <BfDsButton
      text={`Clicked ${val} times`}
      onClick={() => setVal(val + 1)}
    />
  );
}
