import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "XW Social System",
  description: "Internal content review system for Xperience Wave.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-body">{children}</body>
    </html>
  );
}
