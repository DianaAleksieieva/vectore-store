import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "Vector Store Uploader",
  description: "Upload a file and store it in an OpenAI vector store."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
