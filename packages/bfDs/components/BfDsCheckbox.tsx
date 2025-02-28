import * as React from "react";
import { BfDsIcon, type IconSizeType } from "packages/bfDs/components/BfDsIcon.tsx";

export type CheckboxBaseProps = {
  disabled?: boolean;
  label?: string;
  value?: boolean;
  size?: "small" | "medium" | "large";
  style?: React.CSSProperties;
  className?: string;
  meta?: string | React.ReactNode;
  name?: string;
  required?: boolean;
  testId?: string; // for identifying the element in posthog
} & React.HTMLAttributes<HTMLInputElement>;

type EditableProps = CheckboxBaseProps & {
  readonly?: false;
  onChange: (checked: boolean) => void;
};

type ReadonlyProps = CheckboxBaseProps & {
  readonly: true;
  onChange?: never;
};

type BfDsCheckboxProps = EditableProps | ReadonlyProps;

const styles: Record<string, React.CSSProperties> = {
  checkbox: {
    position: "relative",
    display: "inline-block",
  },
  icon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  iconDisabled: {
    opacity: "0.5",
    cursor: "not-allowed",
  },
  input: {
    opacity: "0",
    width: "0",
    height: "0",
    position: "absolute",
  },
  label: {
    marginBottom: 12,
    display: "inline-block",
    width: "100%",
  },
  row: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  meta: {
    color: "var(--textSecondary)",
    marginTop: 4,
  },
};

const sizeStyles: Record<
  string,
  Record<string, { width: IconSizeType; height: IconSizeType } | IconSizeType>
> = {
  small: {
    icon: {
      width: 12,
      height: 12,
    },
    iconSize: 12,
  },
  medium: {
    icon: {
      width: 16,
      height: 16,
    },
    iconSize: 16,
  },
  large: {
    icon: {
      width: 24,
      height: 24,
    },
    iconSize: 24,
  },
};

export function BfDsCheckbox(
  {
    disabled,
    label,
    value,
    onChange,
    className,
    meta,
    name,
    required,
    readonly,
    size = "medium",
    testId,
    ...props
  }: BfDsCheckboxProps,
) {
  const iconName = value ? "checkCircleSolid" : "checkCircle";
  const iconColor = value ? "var(--success)" : "var(--textLight)";
  const sizing =
    sizeStyles[size]?.icon && typeof sizeStyles[size]?.icon === "object"
      ? sizeStyles[size].icon
      : {};

  const checkboxIcon = (
    <div
      style={{
        ...styles.icon,
        ...sizing,
        ...(disabled && styles.iconDisabled),
      }}
    >
      <BfDsIcon
        name={iconName}
        color={iconColor}
        size={sizeStyles[size].iconSize as IconSizeType}
      />
    </div>
  );

  const testIdValue = testId ? `${testId}-${!value}` : undefined;

  const checkbox = (
    <div
      style={{ ...styles.checkbox }}
      data-bf-testid={testIdValue}
    >
      <input
        {...props}
        type="checkbox"
        checked={value}
        disabled={disabled}
        onChange={(e) => onChange && onChange(e.target.checked)}
        style={styles.input}
        className={className}
        name={name}
        required={required}
        readOnly={readonly}
      />
      {checkboxIcon}
    </div>
  );

  if (label) {
    return (
      <label style={styles.label}>
        <div style={styles.row}>
          {checkbox}
          <div style={{ flex: 1 }}>
            {label}
            {required && " *"}
          </div>
        </div>
        {meta && <div style={styles.meta}>{meta}</div>}
      </label>
    );
  }

  return (
    <label>
      {checkbox}
      {meta && <div style={styles.meta}>{meta}</div>}
    </label>
  );
}

export function Example() {
  const [blank, setBlank] = React.useState(false);
  const [small, setSmall] = React.useState(false);
  const [medium, setMedium] = React.useState(false);
  const [large, setLarge] = React.useState(false);
  return (
    <div style={{ width: 300 }}>
      <BfDsCheckbox value={blank} onChange={() => setBlank(!blank)} />
      <BfDsCheckbox
        meta="This is small checkbox"
        size="small"
        label="Small"
        value={small}
        onChange={() => setSmall(!small)}
      />
      <BfDsCheckbox
        size="medium"
        label="Medium"
        value={medium}
        onChange={() => setMedium(!medium)}
      />
      <BfDsCheckbox
        size="large"
        label="Large"
        value={large}
        onChange={() => setLarge(!large)}
      />
    </div>
  );
}
