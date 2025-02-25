import * as React from "react";

export type ToggleBaseProps = {
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

type EditableProps = ToggleBaseProps & {
  readonly?: false;
  onChange: (checked: boolean) => void;
};

type ReadonlyProps = ToggleBaseProps & {
  readonly: true;
  onChange?: never;
};

type BfDsToggleProps = EditableProps | ReadonlyProps;

const styles: Record<string, React.CSSProperties> = {
  toggle: {
    position: "relative",
    display: "inline-block",
  },
  slider: {
    position: "absolute",
    cursor: "pointer",
    top: "0",
    left: "0",
    right: "0",
    bottom: "0",
    backgroundColor: "var(--secondaryButton)",
    borderRadius: "34px",
  },
  switch: {
    position: "absolute",
    transition: "200ms all ease",
    borderRadius: "50%",
    boxShadow: "0 0 2px 0 rgba(10, 10, 10, 0.3)",
  },
  sliderDisabled: {
    opacity: "0.5",
    cursor: "not-allowed",
  },
  input: {
    opacity: "0",
    width: "0",
    height: "0",
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
const sizeStyles: Record<string, Record<string, React.CSSProperties>> = {
  small: {
    toggle: {
      width: 30,
      height: 16,
    },
    switch: {
      width: 10,
      height: 10,
      top: 3,
    },
    switchOff: {
      left: 3,
    },
    switchOn: {
      left: 17,
    },
  },
  medium: {
    toggle: {
      width: 40,
      height: 24,
    },
    switch: {
      width: 16,
      height: 16,
      top: 4,
    },
    switchOff: {
      left: 4,
    },
    switchOn: {
      left: 20,
    },
  },
  large: {
    toggle: {
      width: 60,
      height: 34,
    },
    switch: {
      width: 26,
      height: 26,
      top: 4,
    },
    switchOff: {
      left: 4,
    },
    switchOn: {
      left: 30,
    },
  },
};

export function BfDsToggle(
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
    size = "large",
    testId,
    ...props
  }: BfDsToggleProps,
) {
  const slider = (
    <span
      style={{
        ...styles.slider,
        backgroundColor: value
          ? "var(--secondaryColor015)"
          : "var(--secondaryButton)",
        ...(disabled && styles.sliderDisabled),
      }}
    >
      <span
        style={{
          ...styles.switch,
          ...sizeStyles[size].switch,
          ...(value ? sizeStyles[size].switchOn : sizeStyles[size].switchOff),
          backgroundColor: value ? "var(--success)" : "var(--textLight)",
        }}
      />
    </span>
  );

  const testIdValue = testId ? `${testId}-${!value}` : undefined;

  const toggle = (
    <div
      style={{ ...styles.toggle, ...sizeStyles[size].toggle }}
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
      {slider}
    </div>
  );

  if (label) {
    return (
      <label style={styles.label}>
        <div style={styles.row}>
          <div style={{ flex: 1 }}>
            {label}
            {required && " *"}
          </div>
          {toggle}
        </div>
        {meta && <div style={styles.meta}>{meta}</div>}
      </label>
    );
  }
  return (
    <label>
      {toggle}
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
      <BfDsToggle value={blank} onChange={() => setBlank(!blank)} />
      <BfDsToggle
        meta="This is small toggle"
        size="small"
        label="Small"
        value={small}
        onChange={() => setSmall(!small)}
      />
      <BfDsToggle
        size="medium"
        label="Medium"
        value={medium}
        onChange={() => setMedium(!medium)}
      />
      <BfDsToggle
        size="large"
        label="Large"
        value={large}
        onChange={() => setLarge(!large)}
      />
    </div>
  );
}
