import * as React from "react";

export function PwaIconMarkup({ size }: { size: number }) {
  const frameSize = Math.round(size * 0.625);
  const borderWidth = Math.max(8, Math.round(size * 0.04));
  const borderRadius = Math.round(size * 0.22);
  const fontSize = Math.round(size * 0.34);

  return (
    <div
      style={{
        alignItems: "center",
        background: "#000000",
        display: "flex",
        height: "100%",
        justifyContent: "center",
        width: "100%",
      }}
    >
      <div
        style={{
          alignItems: "center",
          border: `${borderWidth}px solid #3b82f6`,
          borderRadius,
          color: "#ffffff",
          display: "flex",
          fontSize,
          fontWeight: 700,
          height: frameSize,
          justifyContent: "center",
          width: frameSize,
        }}
      >
        FM
      </div>
    </div>
  );
}
