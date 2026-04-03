import { ImageResponse } from "next/og";
import * as React from "react";
import { PwaIconMarkup } from "@/lib/pwa-icon";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(React.createElement(PwaIconMarkup, { size: 512 }), {
    width: 512,
    height: 512,
  });
}
