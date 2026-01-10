import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ReportAway - AI Traffic Defense",
  description: "Advanced AI-powered traffic ticket assessment.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
