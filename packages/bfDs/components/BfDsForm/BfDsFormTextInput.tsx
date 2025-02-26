import {
  type BfDsFormElementProps,
  useBfDsFormContext,
} from "packages/bfDs/components/BfDsForm/BfDsForm.tsx";
import {
  BfDsInput,
  type InputBaseProps,
} from "packages/bfDs/components/BfDsInput.tsx";

export function BfDsFormTextInput(
  { id, title, ...props }: BfDsFormElementProps & InputBaseProps,
) {
  const { data, onChange } = useBfDsFormContext();
  if (!data) return null;
  return (
    <BfDsInput
      {...props}
      label={title}
      type="text"
      name={id}
      // @ts-ignore: TODO @george, need to figure out typing
      value={data[id] ?? ""}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
        onChange?.({ ...data, [id]: e.target.value })}
    />
  );
}
