import * as React from "react";
import { fonts } from "packages/bfDs/const.tsx";
import {
  BfDsIcon,
  type BfDsIconType,
  type IconSizeType,
} from "packages/bfDs/components/BfDsIcon.tsx";
import { RouterLink } from "packages/app/components/Router/RouterLink.tsx";
import {
  BfDsTooltip,
  type BfDsTooltipJustification,
  type BfDsTooltipMenu,
  type BfDsTooltipPosition,
} from "packages/bfDs/components/BfDsTooltip.tsx";
import { BfDsProgress } from "packages/bfDs/components/BfDsProgress.tsx";
import { BfDsSpinner } from "packages/bfDs/components/BfDsSpinner.tsx";

// Types
export type ButtonSizeType = "xlarge" | "large" | "medium" | "small";

export type ButtonKind =
  | "primary"
  | "secondary"
  | "alert"
  | "success"
  | "filled"
  | "filledSecondary"
  | "filledAlert"
  | "filledSuccess"
  | "outline"
  | "outlineDark"
  | "outlineAlert"
  | "outlineSuccess"
  | "overlay"
  | "overlayDark"
  | "overlaySuccess"
  | "accent"
  | "gradientOverlay";

export type ButtonType = {
  xstyle?: {
    borderRadius?: "0" | "6px 0 0 6px" | "0 6px 6px 0";
    flex?: string;
    marginInlineEnd?: number;
    marginInlineStart?: number;
    width?: string | number;
    alignSelf?: "flex-start" | "flex-end";
  };
  disabled?: boolean;
  iconLeft?: BfDsIconType;
  iconRight?: BfDsIconType;
  // if link is provided, the button will be rendered as a Link
  link?: string;
  // if href is provided, the button will be rendered as an anchor tag
  href?: string;
  hrefTarget?: string;
  onClick?: (e: React.FormEvent) => void;
  progress?: number;
  shadow?: boolean;
  // use showSpinner to show a spinner with an icon button
  // doesn't work with overlayDark, overlay, outlineDark, or outline
  showSpinner?: boolean;
  size?: ButtonSizeType;
  subtext?: string;
  testId?: string; // used to identify the button in posthog
  text?: string | null;
  tooltip?: string | React.ReactNode;
  tooltipMenu?: Array<BfDsTooltipMenu>;
  tooltipMenuDropdown?: Array<BfDsTooltipMenu>;
  tooltipPosition?: BfDsTooltipPosition;
  tooltipJustification?: BfDsTooltipJustification;
  type?: "button" | "submit" | "reset";
  kind?: ButtonKind;
  role?: string;
};

const baseStyles: Record<string, React.CSSProperties> = {
  textStyle: {
    flex: 1,
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    lineHeight: "0.9em",
  },
  iconStyle: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    zIndex: 1,
  },
  iconSpinner: {
    position: "absolute",
    top: -1,
    left: -1,
  },
  disabledStyle: {
    opacity: 0.3,
    cursor: "not-allowed",
  },
  dropdownArrow: {
    marginRight: -6,
    marginLeft: 6,
  },
  dropdownArrowIconButton: {
    position: "absolute",
    bottom: 0,
    right: -4,
    height: 15,
    width: 15,
    paddingTop: 2,
    borderRadius: "50%",
    boxSizing: "border-box",
  },
  shadow: {
    boxShadow: "0 5px 10px rgba(0,0,0,.15)",
    borderRadius: 6,
  },
};

// Size configurations
const buttonSizes = {
  xlarge: { fontSize: 16, minHeight: 38, padding: "14px 30px" },
  large: { fontSize: 14, minHeight: 32, padding: "0px 14px" },
  medium: { fontSize: 12, minHeight: 26, padding: "0px 8px" },
  small: { fontSize: 10, minHeight: 20, padding: "0px 6px" },
};

const iconButtonSizes = {
  xlarge: { width: 64, height: 64 },
  large: { width: 40, height: 40 },
  medium: { width: 32, height: 32, padding: "0 2px" },
  small: { width: 22, height: 22, padding: "0 2px" },
};

const iconSizes: Record<string, 10 | 12 | 16 | 24> = {
  xlarge: 24,
  large: 16,
  medium: 16,
  small: 12,
};

// Base style creators
const createBaseButtonStyle = (
  size: ButtonSizeType,
  hover: boolean,
  xstyle?: React.CSSProperties,
): React.CSSProperties => ({
  display: "inline-flex",
  flexDirection: "row",
  justifyContent: "center",
  alignItems: "center",
  flex: "none",
  gap: 6,
  color: "var(--textOnPrimary)",
  backgroundColor: hover ? "var(--primaryButtonHover)" : "var(--primaryButton)",
  borderRadius: 6,
  borderWidth: 1,
  borderStyle: "solid",
  borderColor: hover ? "var(--primaryButtonHover)" : "var(--primaryButton)",
  fontWeight: "bold",
  fontFamily: fonts.fontFamily,
  cursor: "pointer",
  textAlign: "center",
  textDecoration: "none",
  position: "relative",
  ...buttonSizes[size],
  ...xstyle,
});

const createBaseIconButtonStyle = (
  size: ButtonSizeType,
  hover: boolean,
  xstyle?: React.CSSProperties,
): React.CSSProperties => ({
  backgroundColor: hover
    ? "var(--backgroundIconHover)"
    : "var(--backgroundIcon)",
  borderRadius: "50%",
  borderWidth: 1,
  borderStyle: "solid",
  borderColor: hover ? "var(--backgroundIconHover)" : "var(--backgroundIcon)",
  color: "var(--primaryButton)",
  cursor: "pointer",
  textAlign: "center",
  position: "relative",
  ...iconButtonSizes[size],
  ...xstyle,
});

// Button style generator function
const getButtonStyle = (
  kind: ButtonKind,
  size: ButtonSizeType,
  hover: boolean,
  isIconButton: boolean,
  xstyle?: React.CSSProperties,
): React.CSSProperties => {
  // Base style creator based on button type
  const baseStyleCreator = isIconButton
    ? createBaseIconButtonStyle
    : createBaseButtonStyle;
  const baseStyle = baseStyleCreator(size, hover, xstyle);

  // Apply kind-specific style modifications
  switch (kind) {
    case "secondary":
      if (isIconButton) {
        return {
          ...baseStyle,
          color: "var(--textOnSecondary)",
        };
      }
      return {
        ...baseStyle,
        backgroundColor: hover
          ? "var(--secondaryButtonHover)"
          : "var(--secondaryButton)",
        color: "var(--textOnSecondary)",
        borderColor: hover
          ? "var(--secondaryButtonHover)"
          : "var(--secondaryButton)",
      };
    case "alert":
      if (isIconButton) {
        return {
          ...baseStyle,
          color: hover ? "var(--alertHover)" : "var(--alert)",
        };
      }
      return {
        ...baseStyle,
        backgroundColor: hover ? "var(--alertHover)" : "var(--alert)",
        color: "var(--textOnAlert)",
        borderColor: hover ? "var(--alertHover)" : "var(--alert)",
      };
    case "success":
      if (isIconButton) {
        return {
          ...baseStyle,
          color: hover ? "var(--successHover)" : "var(--success)",
        };
      }
      return {
        ...baseStyle,
        backgroundColor: hover ? "var(--successHover)" : "var(--success)",
        color: "var(--textOnSuccess)",
        borderColor: hover ? "var(--successHover)" : "var(--success)",
      };
    case "filled":
      if (isIconButton) {
        return {
          ...baseStyle,
          backgroundColor: hover
            ? "var(--primaryButtonHover)"
            : "var(--primaryButton)",
          borderColor: hover
            ? "var(--primaryButtonHover)"
            : "var(--primaryButton)",
          color: "var(--textOnPrimary)",
        };
      }
      return {
        ...baseStyle,
      };
    case "filledSecondary":
      return {
        ...baseStyle,
        color: "var(--textOnSuccess)",
        backgroundColor: hover
          ? "var(--secondaryButtonBackgroundHover)"
          : "var(--secondaryButtonBackground)",
        borderColor: hover
          ? "var(--secondaryButtonBackgroundHover)"
          : "var(--secondaryButtonBackground)",
      };
    case "filledAlert":
      return {
        ...baseStyle,
        backgroundColor: hover ? "var(--alertHover)" : "var(--alert)",
        borderColor: hover ? "var(--alertHover)" : "var(--alert)",
        color: "var(--textOnAlert)",
      };
    case "filledSuccess":
      return {
        ...baseStyle,
        backgroundColor: hover ? "var(--successHover)" : "var(--success)",
        borderColor: hover ? "var(--successHover)" : "var(--success)",
        color: "var(--textOnSuccess)",
      };
    case "outline":
      return {
        ...baseStyle,
        backgroundColor: hover ? "var(--outlineHover)" : "var(--background)",
        color: "var(--text)",
        borderColor: hover
          ? "var(--secondaryButton)"
          : "var(--secondaryButtonHover)",
      };
    case "outlineDark":
      return {
        ...baseStyle,
        backgroundColor: hover
          ? "var(--outlineDarkHover)"
          : "var(--outlineDark)",
        color: "var(--background)",
        borderColor: hover ? "var(--outlineDarkHover)" : "var(--outlineDark)",
      };
    case "outlineAlert":
      return {
        ...baseStyle,
        backgroundColor: hover ? "var(--outlineHover)" : "var(--background)",
        color: hover ? "var(--alertHover)" : "var(--alert)",
        borderColor: hover ? "var(--alertHover)" : "var(--background)",
      };
    case "outlineSuccess":
      return {
        ...baseStyle,
        backgroundColor: hover ? "var(--outlineHover)" : "var(--background)",
        color: hover ? "var(--successHover)" : "var(--success)",
        borderColor: hover ? "var(--successHover)" : "var(--background)",
      };
    case "overlay":
      return {
        ...baseStyle,
        backgroundColor: hover ? "var(--outlineHover)" : "transparent",
        color: "var(--text)",
        borderColor: hover ? "var(--outlineHover)" : "transparent",
      };
    case "overlayDark":
      return {
        ...baseStyle,
        backgroundColor: hover ? "var(--outlineDarkHover)" : "transparent",
        color: "var(--background)",
        borderColor: hover ? "var(--outlineDarkHover)" : "transparent",
      };
    case "overlaySuccess":
      return {
        ...baseStyle,
        backgroundColor: hover ? "var(--outlineHover)" : "transparent",
        color: "var(--success)",
        borderColor: hover ? "var(--outlineHover)" : "transparent",
      };
    case "accent":
      if (isIconButton) {
        return {
          ...baseStyle,
          color: hover ? "var(--accentButtonHover)" : "var(--accentButton)",
        };
      }
      return {
        ...baseStyle,
        backgroundColor: hover
          ? "var(--accentButtonHover)"
          : "var(--accentButton)",
        color: "var(--textOnAccent)",
        borderColor: hover ? "var(--accentButtonHover)" : "var(--accentButton)",
      };
    case "gradientOverlay":
      if (isIconButton) {
        return {
          ...baseStyle,
          background: hover ? "var(--marketingGradient)" : "transparent",
          color: hover ? "var(--text)" : "var(--textSecondary)",
        };
      }
      return baseStyle;
    default:
      return baseStyle;
  }
};

// Component definitions
const ButtonSpinner = ({
  kind,
  size,
  progress,
  isIconButton,
}: {
  kind: ButtonKind;
  size: ButtonSizeType;
  progress?: number;
  isIconButton: boolean;
}) => {
  if (isIconButton) {
    const iconSize = iconButtonSizes[size].width;
    const backgroundColor = (hover: boolean) =>
      getButtonStyle(kind, size, hover, true).backgroundColor as string;
    const spinnerColor = (hover: boolean) =>
      getButtonStyle(kind, size, hover, true).color as string;

    return (
      <div style={baseStyles.iconSpinner}>
        {progress != null && progress > 0
          ? (
            <BfDsProgress
              size={iconSize}
              progress={progress}
              backgroundColor={backgroundColor(false)}
              spinnerColor={spinnerColor(false)}
            />
          )
          : (
            <BfDsSpinner
              size={iconSize}
              backgroundColor={backgroundColor(false)}
              spinnerColor={spinnerColor(false)}
            />
          )}
      </div>
    );
  }

  const buttonBg = (hover: boolean) =>
    getButtonStyle(kind, size, hover, false).backgroundColor as string;
  const buttonColor = (hover: boolean) =>
    getButtonStyle(kind, size, hover, false).color as string;

  return (
    <div style={baseStyles.iconStyle}>
      {progress != null && progress > 0
        ? (
          <BfDsProgress
            size={iconSizes[size]}
            progress={progress}
            backgroundColor={buttonBg(false)}
            spinnerColor={buttonColor(false)}
          />
        )
        : (
          <BfDsSpinner
            size={iconSizes[size]}
            backgroundColor={buttonBg(false)}
            spinnerColor={buttonColor(false)}
          />
        )}
    </div>
  );
};

const ButtonIcon = ({
  name,
  color,
  size,
  progress,
}: {
  name: BfDsIconType;
  color: string;
  size: number;
  progress?: number;
}) => {
  if (progress && progress > 0) {
    return (
      <div className="mono" style={{ fontSize: 12 }}>
        {Math.round(progress)}%
      </div>
    );
  }

  return <BfDsIcon name={name} color={color} size={size as IconSizeType} />;
};

const DropdownArrow = ({
  isIconButton,
  kind,
  hover,
  size,
  iconColor,
}: {
  isIconButton: boolean;
  kind: ButtonKind;
  hover: boolean;
  size: ButtonSizeType;
  iconColor: string;
}) => {
  const style = isIconButton
    ? {
      ...baseStyles.dropdownArrowIconButton,
      backgroundColor: getButtonStyle(kind, size, hover, isIconButton)
        .borderColor as string,
    }
    : baseStyles.dropdownArrow;

  return (
    <div style={style}>
      <BfDsIcon name="triangleDown" color={iconColor} size={10} />
    </div>
  );
};

// Main Button Component
export function BfDsButton({
  xstyle,
  disabled = false,
  iconLeft,
  iconRight,
  link,
  href,
  hrefTarget,
  onClick,
  progress,
  shadow = false,
  showSpinner = false,
  size = "large",
  subtext,
  testId,
  text,
  tooltip,
  tooltipMenu,
  tooltipMenuDropdown,
  tooltipPosition = "top",
  tooltipJustification = "center",
  kind = "primary",
  type = "button",
  role: passedRole,
}: ButtonType) {
  const [hover, setHover] = React.useState(false);
  const role = passedRole ?? text;
  const isIconButton = !text && !subtext;

  // Get the appropriate color for icons based on button style
  const buttonStyle = getButtonStyle(kind, size, hover, isIconButton, xstyle);
  const iconColor = buttonStyle.color as string;

  // Determine if spinner should be shown
  const shouldShowSpinner = (showSpinner || progress != null) &&
    kind !== "overlay" &&
    kind !== "outlineDark" &&
    kind !== "outline";

  // Event handlers
  const handleMouseOver = () => !disabled && setHover(true);
  const handleMouseOut = () => !disabled && setHover(false);
  const handleClick = (e: React.FormEvent) => {
    if (disabled || link != null || href != null) return;
    onClick?.(e);
  };

  // Render button content
  const renderButtonContent = () => (
    <>
      {shouldShowSpinner && isIconButton && (
        <ButtonSpinner
          kind={kind}
          size={size}
          progress={progress}
          isIconButton={true}
        />
      )}

      {shouldShowSpinner && !isIconButton
        ? (
          <ButtonSpinner
            kind={kind}
            size={size}
            progress={progress}
            isIconButton={false}
          />
        )
        : (
          iconLeft && (
            <div style={baseStyles.iconStyle}>
              <ButtonIcon
                name={iconLeft}
                color={iconColor}
                size={iconSizes[size]}
                progress={progress}
              />
            </div>
          )
        )}

      {!isIconButton && (
        <div style={baseStyles.textStyle}>
          <div>{text}</div>
          {subtext && <div style={{ fontSize: "0.7em" }}>{subtext}</div>}
        </div>
      )}

      {iconRight && (
        <div style={baseStyles.iconStyle}>
          <BfDsIcon name={iconRight} color={iconColor} size={iconSizes[size]} />
        </div>
      )}

      {tooltipMenuDropdown && (
        <DropdownArrow
          isIconButton={isIconButton}
          kind={kind}
          hover={hover}
          size={size}
          iconColor={iconColor}
        />
      )}
    </>
  );

  // Create button element
  const buttonElement = (
    <button
      disabled={disabled}
      type={type}
      style={{
        ...buttonStyle,
        ...(disabled ? baseStyles.disabledStyle : {}),
        ...(shadow ? baseStyles.shadow : {}),
      }}
      onClick={handleClick}
      onMouseOver={handleMouseOver}
      onMouseOut={handleMouseOut}
      data-bf-icon={iconLeft}
      data-bf-testid={testId}
      role={role ?? text ?? "button"}
    >
      {renderButtonContent()}
    </button>
  );

  // Wrap with link if needed
  let wrappedButton = buttonElement;
  if (link) {
    wrappedButton = (
      <RouterLink to={link} style={{ display: "block" }} target={hrefTarget}>
        {buttonElement}
      </RouterLink>
    );
  } else if (href) {
    wrappedButton = (
      <a href={href} target={hrefTarget}>
        {buttonElement}
      </a>
    );
  }

  // Wrap with tooltip if needed
  if (tooltip || tooltipMenu || tooltipMenuDropdown) {
    return (
      <BfDsTooltip
        menu={tooltipMenu ?? tooltipMenuDropdown}
        justification={tooltipJustification}
        position={tooltipPosition}
        text={tooltip}
      >
        {wrappedButton}
      </BfDsTooltip>
    );
  }

  return wrappedButton;
}
