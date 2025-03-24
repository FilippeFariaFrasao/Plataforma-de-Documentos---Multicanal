import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Documentation Portal - Multicanal",
  description: "Internal documentation portal for Multicanal employees",
};

export default function DocumentsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
