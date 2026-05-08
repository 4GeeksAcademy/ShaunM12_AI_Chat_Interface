import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Workspace",
  description: "Developer-focused AI chat with history and token metrics"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
