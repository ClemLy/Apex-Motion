import type { ReactNode } from "react";
import { ConfiguratorProvider } from "@/lib/configurator/store";
import { CaptureProvider } from "@/lib/capture/CaptureProvider";

export default function ConfiguratorLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <ConfiguratorProvider>
      <CaptureProvider>{children}</CaptureProvider>
    </ConfiguratorProvider>
  );
}
