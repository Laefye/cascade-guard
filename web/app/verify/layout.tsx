import type { Metadata } from "next";
import "../globals.css";
import { Manrope } from 'next/font/google'

const manrope = Manrope({ subsets: ['latin', 'cyrillic'] })

export const metadata: Metadata = {
  title: "Cascade Guard",
  description: "Проверка на робота!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`h-full antialiased bg-background text-text ${manrope.className}`}
    >
      <body>{children}</body>
    </html>
  );
}
