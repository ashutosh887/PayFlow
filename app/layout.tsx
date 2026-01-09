import type { Metadata } from "next";
import "./globals.css";
import config from "@/config";
import { Nunito_Sans } from "next/font/google";
import { ThemeProvider } from "@/components/providers/ThemeProvider";

const nunitoSans = Nunito_Sans({ variable: "--font-sans" });

export const metadata: Metadata = {
  title: config.appName,
  description: config.appDescription,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={nunitoSans.variable}
      suppressHydrationWarning
    >
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
