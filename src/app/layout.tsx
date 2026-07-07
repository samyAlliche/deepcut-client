import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { Figtree } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/next";
// import AdSense from "@/components/AdSense";

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://deepcut.twxntytwo.com"),
  title: "Deepcut - Random Samples From Curated YouTube Playlists",
  description: "Deepcut — random samples from curated YouTube playlists.",
  openGraph: {
    title: "Deepcut",
    description:
      "Pick random samples from curated YouTube playlists with Deepcut.",
    url: "https://deepcut.twxntytwo.com",
    siteName: "Deepcut",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Deepcut",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* AdSense removed while AdCard is disabled — re-add <AdSense pId="ca-pub-6104349001448914" /> in <head> when ads return */}
      <body className={`${figtree.variable} antialiased`}>
        <ThemeProvider
          attribute={"data-theme"}
          defaultTheme="dark"
          enableSystem={false}
          storageKey="deepcut-theme"
        >
          {children}
          <Toaster />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
