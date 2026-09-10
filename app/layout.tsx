import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bhairavi Bhajans | Divine Melodies",
  description: "Soulful bhajans and timeless devotion.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
