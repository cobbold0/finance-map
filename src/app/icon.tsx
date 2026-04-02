import { ImageResponse } from "next/og";

export const size = {
  width: 256,
  height: 256,
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background: "#000",
          display: "flex",
          height: "100%",
          justifyContent: "center",
          width: "100%",
        }}
      >
        <div
          style={{
            alignItems: "center",
            border: "10px solid #3b82f6",
            borderRadius: 56,
            color: "white",
            display: "flex",
            fontSize: 88,
            fontWeight: 700,
            height: 160,
            justifyContent: "center",
            width: 160,
          }}
        >
          FM
        </div>
      </div>
    ),
    size,
  );
}
