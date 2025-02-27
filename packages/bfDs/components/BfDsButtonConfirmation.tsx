import * as React from "react";
import {
  BfDsButton,
  type ButtonSizeType,
} from "packages/bfDs/components/BfDsButton.tsx";
import {
  BfDsIcon,
  type BfDsIconType,
  type IconSizeType,
} from "packages/bfDs/components/BfDsIcon.tsx";
import { getLogger } from "packages/logger.ts";

const logger = getLogger(import.meta);

const styles: Record<string, React.CSSProperties> = {
  confirmation: {
    position: "absolute",
    backgroundColor: "var(--backgroundIcon)",
    borderRadius: 20,
    display: "flex",
    flexDirection: "row",
    right: 0,
    top: 0,
    zIndex: 1,
  },
  confirmationBase: {
    position: "relative",
  },
  selectedIcon: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
};

type Props = {
  icon: BfDsIconType;
  iconSelected?: BfDsIconType;
  onConfirm: () => void;
  // onCancel?: () => void;
  showSpinner?: boolean;
  size?: ButtonSizeType;
  testId?: string; // for identifying the element in posthog
};

export function BfDsButtonConfirmation({
  icon,
  iconSelected = icon,
  onConfirm,
  // onCancel,
  showSpinner = false,
  size = "large",
  testId,
}: Props) {
  const [showConfirmation, setShowConfirmation] = React.useState(false);

  const handleConfirm = () => {
    setShowConfirmation(false);
    onConfirm();
  };

  let iconSize: IconSizeType;
  let iconSizeSelected;
  switch (size) {
    case "xlarge":
      iconSize = 32;
      iconSizeSelected = 64;
      break;
    case "large":
    default:
      iconSize = 16;
      iconSizeSelected = 40;
      break;
    case "medium":
      iconSize = 12;
      iconSizeSelected = 30;
      break;
    case "small":
      iconSize = 10;
      iconSizeSelected = 22;
      break;
  }
  return (
    <div className="confirmationBase" style={styles.confirmationBase}>
      <BfDsButton
        iconLeft={icon}
        kind="alert"
        onClick={() => setShowConfirmation(true)}
        size={size}
        testId={testId}
      />
      {showConfirmation && (
        <div style={styles.confirmation}>
          <BfDsButton
            iconLeft="back"
            kind="success"
            onClick={() => setShowConfirmation(false)}
            size={size}
            testId={`${testId}-cancel`}
          />
          <BfDsButton
            iconLeft="check"
            kind="alert"
            onClick={handleConfirm}
            showSpinner={showSpinner}
            size={size}
            testId={`${testId}-confirm`}
          />
          <div
            style={{
              ...styles.selectedIcon,
              width: iconSizeSelected,
              height: iconSizeSelected,
            }}
            onClick={() => setShowConfirmation(false)}
            data-bf-testid={`${testId}-cancel-icon`}
          >
            <BfDsIcon
              name={iconSelected}
              color="var(--outlineDark)"
              size={iconSize}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export function Example() {
  return (
    <BfDsButtonConfirmation
      icon="trash"
      onConfirm={() => logger.info("deleted")}
    />
  );
}
