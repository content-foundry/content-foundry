type Props = {
  size?: number;
  spinnerColor?: string;
  backgroundColor?: string;
  waitIcon?: boolean;
};

const topFrom = "23.33,58.48 57.88,-0.04 57.88,58.48"; // bolt
const topTo = "25,20 75,20 50.04,58.47"; // hourglass
const bottomFrom = "77.27,41.37 42.72,99.89 42.72,41.37"; // bolt
const bottomTo = "75,77 25,77 49.96,38.56"; // hourglass

export function BfDsSpinner(
  {
    size = 48,
    spinnerColor = "var(--success)",
    backgroundColor = "var(--background)",
    waitIcon = false,
  }: Props,
) {
  const styles: Record<string, React.CSSProperties> = {
    pending: {
      borderRadius: "50%",
      width: "100%",
      height: "100%",
      background:
        `radial-gradient(closest-side, ${backgroundColor} 79%, transparent 80% 100%), conic-gradient(${spinnerColor} 60%, ${backgroundColor} 0)`,
    },
    spinnerBase: {
      position: "relative",
      width: size,
      height: size,
    },
    waitIcon: {
      position: "absolute",
      width: "90%",
      height: "90%",
      top: "5%",
      left: "5%",
    },
  };

  // `.spinner` animation is set in `renderer.ts`

  return (
    <div style={styles.spinnerBase}>
      <div className="spinner" style={styles.pending} />
      {waitIcon && (
        <div style={styles.waitIcon}>
          <svg viewBox="0 0 100 100">
            <defs>
            </defs>
            <polygon points="" fill={spinnerColor}>
              <animate
                attributeName="points"
                calcMode="spline"
                dur="5s"
                fill="loop"
                repeatCount="indefinite"
                values={`${topFrom}; ${topFrom}; ${topTo}; ${topTo}; ${topFrom}`}
                keyTimes="0; 0.4; 0.5; 0.9; 1"
                keySplines="0 0 1 1; 0.5 0 0.5 1; 0 0 1 1; 0.5 0 0.5 1"
              />
            </polygon>
            <polygon points="" fill={spinnerColor}>
              <animate
                attributeName="points"
                calcMode="spline"
                dur="5s"
                fill="loop"
                repeatCount="indefinite"
                values={`${bottomFrom}; ${bottomFrom}; ${bottomTo}; ${bottomTo}; ${bottomFrom}`}
                keyTimes="0; 0.4; 0.5; 0.9; 1"
                keySplines="0 0 1 1; 0.5 0 0.5 1; 0 0 1 1; 0.5 0 0.5 1"
              />
            </polygon>
          </svg>
        </div>
      )}
    </div>
  );
}

type FullPageProps = {
  xstyle?: React.CSSProperties;
};

export function BfDsFullPageSpinner({ xstyle = {} }: FullPageProps) {
  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
        boxSizing: "border-box",
        ...xstyle,
      }}
    >
      <BfDsSpinner backgroundColor="var(--pageBackground)" waitIcon />
    </div>
  );
}
