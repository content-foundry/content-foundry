import { iso } from "packages/app/__generated__/__isograph/iso.ts";
import { CfLogo } from "packages/bfDs/static/CfLogo.tsx";
import { BfDsInput } from "packages/bfDs/components/BfDsInput.tsx";
import { BfDsButton } from "packages/bfDs/components/BfDsButton.tsx";
import { BfDsDropzone } from "packages/bfDs/components/BfDsDropzone.tsx";
import { useState } from "react";
import { classnames } from "lib/classnames.ts";
import { BfDsTextArea } from "packages/bfDs/components/BfDsTextArea.tsx";

export const EditVoice = iso(`
  field BfCurrentViewerLoggedIn.EditVoice @component {
    __typename
  }
`)(function EditVoice({ data }) {
  const [showChanges, setShowChanges] = useState(false);
  const [voiceLinks, setVoiceLinks] = useState<string[]>([]);
  const sectionClasses = classnames([
    "voice-section-voice-style",
    {
      highlight: !showChanges,
    },
  ]);

  const hasVoice = data?.storyBank?.__typename;

  return (
    
  );
});
