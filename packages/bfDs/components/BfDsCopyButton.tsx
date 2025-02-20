import * as React from "react";
import {
  BfDsButton,
  type ButtonKind,
} from "packages/bfDs/components/BfDsButton.tsx";
import { useCopyToClipboard } from "packages/bfDs/hooks/useCopyToClipboard.ts";
type Props = {
  textToCopy: string;
  buttonText?: string;
  kind?: ButtonKind;
};
const { useState } = React;
export function BfDsCopyButton(
  { textToCopy, buttonText = "Copy", kind = "overlay" }: Props,
) {
  const [copied, setCopied] = useState(false);
  const [, copy] = useCopyToClipboard();
  const handleCopy = () => {
    copy(textToCopy);
    setCopied(true);
    globalThis.setTimeout(() => (setCopied(false)), 1000);
  };

  const text = copied ? "Copied!" : buttonText;

  return <BfDsButton kind={kind} text={text} onClick={handleCopy} />;
}
