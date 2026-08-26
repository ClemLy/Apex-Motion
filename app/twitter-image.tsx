import { ImageResponse } from "next/og";
import { OgImageMark } from "@/lib/ogImage";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(<OgImageMark />, { ...size });
}
