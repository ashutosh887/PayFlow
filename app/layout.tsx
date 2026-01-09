import type { Metadata } from "next";
import "./globals.css";
import config from "@/config";
import { Nunito_Sans } from "next/font/google";

const nunitoSans = Nunito_Sans({variable:'--font-sans'});

export const metadata: Metadata = {
  title: config.appName,
  description: config.appDescription,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={nunitoSans.variable}>
      <body
        className="antialiased"
      >
        {children}
      </body>
    </html>
  );
}
