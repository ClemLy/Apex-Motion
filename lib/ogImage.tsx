/**
 * Shared between app/opengraph-image.tsx and app/twitter-image.tsx so the
 * two file-convention routes render byte-identical art instead of two
 * hand-kept copies drifting apart.
 */
export function OgImageMark() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#020202",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          background:
            "radial-gradient(circle at 50% 38%, rgba(245,245,245,0.08), transparent 60%)",
        }}
      />

      <svg
        width="120"
        height="120"
        viewBox="0 0 1000 1000"
        style={{ marginBottom: 40 }}
      >
        <polygon
          points="500,140 870,760 680,760 500,430 320,760 130,760"
          fill="#f5f5f5"
        />
        <rect
          x="150"
          y="838"
          width="290"
          height="18"
          fill="#f5f5f5"
          opacity={0.6}
        />
        <rect
          x="560"
          y="838"
          width="290"
          height="18"
          fill="#f5f5f5"
          opacity={0.6}
        />
      </svg>

      <div
        style={{
          display: "flex",
          fontSize: 64,
          fontWeight: 700,
          letterSpacing: 8,
          color: "#f5f5f5",
        }}
      >
        APEX
        <span style={{ color: "#6b6b6b", margin: "0 20px" }}>{"//"}</span>
        MOTION
      </div>

      <div
        style={{
          display: "flex",
          marginTop: 28,
          fontSize: 24,
          letterSpacing: 4,
          textTransform: "uppercase",
          color: "#8a8a8a",
        }}
      >
        Exploration numerique de l&apos;ingenierie Porsche
      </div>
    </div>
  );
}
