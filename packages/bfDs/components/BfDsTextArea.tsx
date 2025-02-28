import * as React from "react";
import { fonts } from "packages/bfDs/const.tsx";

export type TextAreaProps = {
  onChange?: React.ChangeEventHandler<HTMLTextAreaElement>;
  label?: string;
  className?: string;
  xstyle?: React.CSSProperties;
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const styles: Record<string, React.CSSProperties> = {
  textarea: {
    background: "var(--background)",
    color: "var(--text)",
    fontFamily: fonts.fontFamily,
    fontSize: 16,
    padding: "6px 12px",
    borderRadius: 6,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "var(--textSecondary)",
    boxSizing: "border-box",
  },
  label: {
    display: "flex",
    flexDirection: "column",
    marginBottom: 12,
  },
};

export function BfDsTextArea(
  {
    label,
    value,
    onChange,
    placeholder,
    className,
    name,
    required,
    rows,
    xstyle,
    ...props
  }: TextAreaProps,
) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const adjustHeight = () => {
      if (!xstyle?.height && !xstyle?.flex) {
        textarea.style.height = "auto";
        textarea.style.height = `${textarea.scrollHeight}px`;
      }
    };

    adjustHeight();
  }, [value]);

  const textarea = (
    <textarea
      {...props}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      style={{ ...styles.textarea, ...xstyle }}
      className={className}
      name={name}
      ref={textareaRef}
      required={required}
      rows={rows ?? 2}
    />
  );

  if (label) {
    return (
      <label style={styles.label}>
        {label}
        {required && " *"}
        {textarea}
      </label>
    );
  }
  return textarea;
}
