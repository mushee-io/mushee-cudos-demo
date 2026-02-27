import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mushee Demo (ASI:Cloud)",
  description: "Mushee ID + Proof-of-Human + AI powered by ASI:Cloud",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
