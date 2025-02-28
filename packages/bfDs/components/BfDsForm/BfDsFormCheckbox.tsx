import {
  type BfDsFormElementProps,
  useBfDsFormContext,
} from "packages/bfDs/components/BfDsForm/BfDsForm.tsx";
import {
  BfDsCheckbox,
  type CheckboxBaseProps,
} from "packages/bfDs/components/BfDsCheckbox.tsx";

export function BfDsFormCheckbox(
  { id, title, ...props }: BfDsFormElementProps & CheckboxBaseProps,
) {
  const { data, onChange } = useBfDsFormContext();
  if (!data) return null;
  return (
    <BfDsCheckbox
      {...props}
      label={title}
      name={id}
      // @ts-ignore: TODO @george, need to figure out typing
      value={data[id] === true}
      onChange={(checked) => onChange?.({ ...data, [id]: checked })}
    />
  );
}
