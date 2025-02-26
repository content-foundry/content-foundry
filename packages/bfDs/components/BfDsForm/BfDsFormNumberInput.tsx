import {
  type BfDsFormValue,
  useBfDsFormContext,
} from "packages/bfDs/components/BfDsForm/BfDsForm.tsx";
import {
  BfDsInput,
  type InputBaseProps,
} from "packages/bfDs/components/BfDsInput.tsx";

type Props = { id: string; title: string } & InputBaseProps;

export function BfDsFormNumberInput(
  { id, title, ...props }: Props,
) {
  const { data, onChange } = useBfDsFormContext() as BfDsFormValue;
  if (!data) return null;
  return (
    <BfDsInput
      {...props}
      label={title}
      type="number"
      name={id}
      value={data[id]}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
        onChange?.({ ...data, [id]: e.target.value })}
    />
  );
}
