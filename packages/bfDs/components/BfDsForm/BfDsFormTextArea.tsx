import {
  type BfDsFormElementProps,
  useBfDsFormContext,
} from "packages/bfDs/components/BfDsForm/BfDsForm.tsx";
import { BfDsTextArea } from "packages/bfDs/components/BfDsTextArea.tsx";

export function BfDsFormTextArea({ id, rows, title, placeholder }: BfDsFormElementProps) {
  const { data, onChange } = useBfDsFormContext();
  if (!data) return null;
  return (
    <BfDsTextArea
      key={id}
      label={title}
      name={id}
      // @ts-ignore: TODO @george, need to figure out typing
      value={data[id] ?? ""}
      onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) =>
        onChange?.({ ...data, [id]: event.target.value })}
      placeholder={placeholder}
      rows={parseInt(rows as string)}
    />
  );
}
