import { useState } from "react";
import { BfDsButton } from "packages/bfDs/components/BfDsButton.tsx";

type Props = {
  complexObject?: Record<string, Record<string, number>>;
  complexMap?: Map<string, number>;
};
export function ExampleComponent({ complexObject, complexMap }: Props) {
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
