import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Finance Map",
    short_name: "Finance Map",
    description: "A mobile-first personal finance operating system.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#000000",
    orientation: "portrait",
    icons: [
      {
        src: "/icon",
        sizes: "256x256",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
