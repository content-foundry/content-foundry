import { useBfDsFormContext } from "packages/bfDs/components/BfDsForm/BfDsForm.tsx";
import {
  BfDsTagInput,
  type TagInputProps,
} from "packages/bfDs/components/BfDsTagInput.tsx";

type Props = { id: string; title: string } & TagInputProps;

export function BfDsFormTagInput(
  { id, title, ...props }: Props,
) {
  const { data, onChange } = useBfDsFormContext();
  if (!data) return null;
  return (
    <BfDsTagInput
      {...props}
      // @ts-ignore: TODO @george, need to figure out typing
      value={data[id] ?? []}
      onChange={(tags) => onChange?.({ ...data, [id]: tags })}
      label={title}
      name={id}
    />
  );
}
