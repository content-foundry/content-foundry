import * as React from "react";
import { BfDsTooltip } from "packages/bfDs/components/BfDsTooltip.tsx";
import { BfDsInput } from "packages/bfDs/components/BfDsInput.tsx";

const { useEffect } = React;

// This function adds double backslashes before special regular expression characters
function escapeRegExp(string: string) {
  return string.replace(/[\^\-\\]/g, "\\$&"); // escape ^, - and \
}
const specialCharsTooltip =
  "^ $ * . { } ( ) ? - \" ! @ # % & / \\ , > < ' : ; | _ ~ ` + =";
const specialChars = "^$*.{}()?-\"!@#%&/\\,><':;|_~`+=";
const escapedSpecialChars = escapeRegExp(specialChars);

const styles: Record<string, React.CSSProperties> = {
  meta: {
    color: "var(--textSecondary)",
    marginBottom: 12,
  },
  reqNotMet: {
    color: "var(--alert)",
  },
};
type Props = {
  value: string;
  onChange: (value: string) => void;
  setIsValid?: (isValid: boolean) => void;
  label?: string;
  placeholder?: string;
};

export function BfDsPassword(
  {
    value,
    onChange,
    setIsValid,
    label = "Password",
    placeholder = "Your password",
  }: Props,
) {
  const [passwordRequirements, setPasswordRequirements] = React.useState({
    hasNumber: false,
    hasLowercase: false,
    hasUppercase: false,
    hasSymbol: false,
    hasMinLength: false,
  });

  useEffect(() => {
    const password = value;
    const hasNumber = /\d/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasUppercase = /[A-Z]/.test(password);
    const hasSymbol = new RegExp(`[${escapedSpecialChars}]`).test(password);
    const hasMinLength = password.length >= 8;
    setPasswordRequirements({
      hasNumber,
      hasLowercase,
      hasUppercase,
      hasSymbol,
      hasMinLength,
    });
    if (
      hasNumber && hasLowercase && hasUppercase && hasSymbol && hasMinLength
    ) {
      setIsValid?.(true);
    }
  }, [value]);

  const passwordMeta = (
    <>
      Must be{" "}
      <span
        style={{
          ...(passwordRequirements.hasMinLength !== true && styles.reqNotMet),
        }}
      >
        at least 8 characters
      </span>{" "}
      and{" "}
      <span
        style={{
          ...(passwordRequirements.hasNumber !== true && styles.reqNotMet),
        }}
      >
        contain a number
      </span>,{" "}
      <span
        style={{
          ...(passwordRequirements.hasLowercase !== true && styles.reqNotMet),
        }}
      >
        lowercase letter
      </span>,{" "}
      <span
        style={{
          ...(passwordRequirements.hasUppercase !== true && styles.reqNotMet),
        }}
      >
        uppercase letter
      </span>, and{" "}
      <BfDsTooltip text={specialCharsTooltip} delay={0}>
        <span
          style={{
            ...(passwordRequirements.hasSymbol !== true && styles.reqNotMet),
          }}
        >
          symbol
        </span>
      </BfDsTooltip>
      .
    </>
  );
  return (
    <BfDsInput
      label={label}
      meta={passwordMeta}
      type="password"
      value={value}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
        onChange(e.currentTarget.value)}
      pattern={`(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[${escapedSpecialChars}]).{8,}`}
      placeholder={placeholder}
      required
    />
  );
}
