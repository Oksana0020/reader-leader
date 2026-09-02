/* Reference-led rule: the application frame preserves the warm student canvas and evidence-led educator hierarchy without generic dashboard chrome. */
import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { SessionProvider } from "@/app/providers";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: { default: "Reader Leader", template: "%s · Reader Leader" },
  description: "A supportive reading fluency tutor for early readers and their educators.",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#fbf8ee" };

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <html lang="en-GB"><body><SessionProvider>{children}</SessionProvider></body></html>;
}
