import * as React from "react";
import { fonts } from "packages/bfDs/const.tsx";
import { BfDsSpinner } from "packages/bfDs/components/BfDsSpinner.tsx";

export type InputBaseProps = {
  autoFocus?: boolean;
  autoSelect?: boolean;
  disabled?: boolean;
  label?: string;
  value?: string | number | Array<string> | undefined;
  placeholder?: string;
  type?: string;
  style?: React.CSSProperties;
  className?: string;
  meta?: string | React.ReactNode;
  name?: string;
  numberAttributes?: NumberType;
  pattern?: string;
  required?: boolean;
  showSpinner?: boolean;
  testId?: string; // for identifying the element in posthog
  xstyle?: React.CSSProperties;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  onFocus?: React.FocusEventHandler<HTMLInputElement>;
} & React.InputHTMLAttributes<HTMLInputElement>;

type EditableProps = InputBaseProps & {
  readonly?: false;
  onChange?: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
};

type ReadonlyProps = InputBaseProps & {
  readonly: true;
  onChange?: never;
  onKeyDown?: never;
};
type InputProps = EditableProps | ReadonlyProps;

type NumberType = {
  min?: number;
  max?: number;
  step?: number;
};

const styles: Record<string, React.CSSProperties> = {
  disabledStyle: {
    opacity: 0.3,
    cursor: "not-allowed",
  },
  input: {
    background: "var(--background)",
    boxSizing: "border-box",
    color: "var(--text)",
    fontFamily: fonts.fontFamily,
    fontSize: 16,
    padding: "6px 10px",
    borderRadius: 6,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "var(--textSecondary)",
    width: "100%",
  },
  inputContainer: {
    position: "relative",
  },
  label: {
    display: "flex",
    flexDirection: "column",
  },
  meta: {
    color: "var(--textSecondary)",
    marginTop: 4,
  },
  spinner: {
    position: "absolute",
    right: 10,
    top: 10,
  },
};

export function BfDsInput(
  {
    autoFocus,
    autoSelect,
    disabled,
    label,
    value,
    onBlur,
    onChange,
    onFocus,
    onKeyDown,
    placeholder,
    type,
    className,
    meta,
    name,
    numberAttributes = {},
    pattern,
    required,
    readonly,
    showSpinner,
    testId,
    xstyle,
    ...props
  }: InputProps,
) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (autoSelect) {
      inputRef.current?.select();
    }
  }, [autoSelect]);

  const input = (
    <input
      {...props}
      disabled={disabled}
      value={value}
      onBlur={onBlur}
      onChange={onChange}
      onKeyDown={onKeyDown}
      onFocus={onFocus}
      placeholder={placeholder}
      type={type}
      style={{
        ...styles.input,
        ...xstyle,
        ...(disabled && styles.disabledStyle),
      }}
      className={className}
      name={name}
      pattern={pattern}
      required={required}
      readOnly={readonly}
      ref={inputRef}
      data-bf-testid={testId}
      autoFocus={autoFocus}
      {...(type === "number" ? numberAttributes : {})}
    />
  );

  if (label) {
    return (
      <label htmlFor={name} style={styles.label}>
        {label}
        {required && " *"}
        <div style={styles.inputContainer}>
          {input}
          {showSpinner && (
            <div style={styles.spinner}>
              <BfDsSpinner size={16} />
            </div>
          )}
        </div>
        {meta && <div style={styles.meta}>{meta}</div>}
      </label>
    );
  }
  return (
    <div>
      <div style={styles.inputContainer}>
        {input}
        {showSpinner && (
          <div style={styles.spinner}>
            <BfDsSpinner size={16} />
          </div>
        )}
      </div>
      {meta && <div style={styles.meta}>{meta}</div>}
    </div>
  );
}

export function Example() {
  return (
    <div className="ui-group">
      <BfDsInput
        label="Text input"
        placeholder="Placeholder"
        onChange={() => {}}
      />
      <BfDsInput
        label="Number input"
        placeholder="Placeholder"
        type="number"
        onChange={() => {}}
      />
      <BfDsInput
        label="Password input"
        placeholder="Placeholder"
        type="password"
        onChange={() => {}}
      />
      <BfDsInput
        label="Disabled input"
        placeholder="Placeholder"
        disabled
        onChange={() => {}}
      />
      <BfDsInput
        label="Required input"
        placeholder="Placeholder"
        required
        onChange={() => {}}
      />
      <BfDsInput label="Read-only input" placeholder="Placeholder" readonly />
      <BfDsInput
        label="Input with meta"
        placeholder="Placeholder"
        meta="Meta"
        onChange={() => {}}
      />
      <BfDsInput
        label="Input with spinner"
        placeholder="Placeholder"
        showSpinner
        onChange={() => {}}
      />
    </div>
  );
}
