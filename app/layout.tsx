import type { Metadata } from "next";
import { SITE_URL, SOCIAL_LINKS } from "@/lib/constants";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import Layout from "@/components/layout/Layout";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  // Lets every page emit absolute URLs for its link-preview card
  metadataBase: new URL(SITE_URL),
  title: {
    template: "%s | Daily Puzzle Games",
    default: "Daily Puzzle Games",
  },
  description: "Daily arithmetic puzzle games to challenge your mind",
  applicationName: "Make Ten",
  appleWebApp: { capable: true, title: "Make Ten", statusBarStyle: "black-translucent" },
  openGraph: {
    type: "website",
    siteName: "Make Ten",
    locale: "en_US",
    url: SITE_URL,
    title: "Make Ten - Daily Puzzle Games",
    description: "Daily arithmetic puzzle games to challenge your mind",
  },
  twitter: {
    card: "summary_large_image",
    site: `@${SOCIAL_LINKS.twitterHandle}`,
    creator: `@${SOCIAL_LINKS.twitterHandle}`,
  },
  verification: {
    google: "_W7qsE12Njou18Gc_VU9ygWW4vfGPdE1c2E_IcrEIi4",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Layout>{children}</Layout>
          <Toaster
            position="bottom-right"
            closeButton
            richColors
            className="sm:max-w-[420px]"
          />
          <Analytics />
          <SpeedInsights />
        </ThemeProvider>
      </body>
    </html>
  );
}
