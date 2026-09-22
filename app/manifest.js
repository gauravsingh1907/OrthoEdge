export default function manifest() {
  return {
    name: "OrthoEdge",
    short_name: "OrthoEdge",
    description: "Offline-first osteoarthritis screening platform for healthcare workers",
    start_url: "/",
    display: "standalone",
    background_color: "#0f172a",
    theme_color: "#0f172a",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}