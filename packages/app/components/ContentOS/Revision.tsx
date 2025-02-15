import { useRef, useState } from "react";
import {
  useBfDsFormContext,
} from "packages/bfDs/components/BfDsForm/BfDsForm.tsx";
import { BfDsButton } from "packages/bfDs/components/BfDsButton.tsx";

type Props = {
  id: string;
  revision: string;
  explanation: string;
};

export function Revision({ id, revision, explanation }: Props) {
  const [showExplanation, setShowExplanation] = useState(false);
  const [expand, setExpand] = useState(true);
  const { data, onChange } = useBfDsFormContext();
  // @ts-ignore: TODO @george, need to figure out typing
  const originalRef = useRef<HTMLDivElement>(data[id] ?? "");

  if (!data) return null;

  // @ts-ignore: TODO @george, need to figure out typing
  const isOriginalText = data[id] === originalRef.current;

  return (
    <div className="revision">
      {expand && (
        <div className="revision-content">
          <div className="revision-header">
            Suggested Revision
          </div>
          <div className="revision-text">
            {revision}
          </div>
          <div className="revision-explanation-button">
            <BfDsButton
              iconLeft="exclamationCircle"
              kind={showExplanation ? "outline" : "overlay"}
              onClick={() => setShowExplanation(!showExplanation)}
              size="medium"
              tooltip={showExplanation
                ? "Hide Explanation"
                : "Show Explanation"}
            />
          </div>
          {showExplanation && (
            <div className="revision-explanation">
              {explanation}
            </div>
          )}
          {
            /* <div className="revision-confidence">
          {confidence}
        </div> */
          }
        </div>
      )}
      <div className="revision-actions">
        {isOriginalText
          ? (
            <BfDsButton
              iconLeft="check"
              kind="overlay"
              onClick={() => {
                onChange?.({ ...data, [id]: revision });
                setExpand(false);
              }}
              size="medium"
              tooltip="Accept this revision"
            />
          )
          : (
            <BfDsButton
              iconLeft="back"
              kind="overlay"
              onClick={() => {
                onChange?.({ ...data, [id]: originalRef.current });
                setExpand(false);
              }}
              size="medium"
              tooltip="Go back to original text"
            />
          )}
        <BfDsButton
          iconLeft={expand ? "arrowDown" : "arrowLeft"}
          kind="overlay"
          onClick={() => setExpand(!expand)}
          size="medium"
          tooltip={expand ? "Collapse" : "Expand"}
        />
      </div>
    </div>
  );
}
