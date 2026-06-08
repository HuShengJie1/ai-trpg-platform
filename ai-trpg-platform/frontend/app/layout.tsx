import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI TRPG Platform",
  description: "AI-powered tabletop role-playing platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
