import type { Metadata, Viewport } from "next";
import { JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://sentinel.security"),
  title: {
    default: "Sentinel | Stateless Security Scanner",
    template: "%s | Sentinel",
  },
  description: "Instant security analysis for any URL. We scan for leaked secrets, misconfigured headers, and vulnerabilities. Zero storage. Complete privacy.",
  keywords: [
    "security scanner",
    "vulnerability scan",
    "secret detection",
    "header analysis",
    "web security",
    "SSL/TLS check",
    "cookie security",
    "mixed content detection",
    "javascript security",
    "SRI check",
    "GraphQL security",
    " penetration testing",
    "security audit",
    "website scanner",
    "threat detection",
  ],
  authors: [{ name: "Caseinn" }],
  creator: "Caseinn",
  publisher: "Caseinn",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://sentinel.security",
    title: "Sentinel | Stateless Security Scanner",
    description: "Instant security analysis for any URL. We scan for leaked secrets, misconfigured headers, and vulnerabilities. Zero storage. Complete privacy.",
    siteName: "Sentinel",
    images: [
      {
        url: "/logo/og-image.png",
        width: 1200,
        height: 630,
        alt: "Sentinel Security Scanner",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sentinel | Stateless Security Scanner",
    description: "Instant security analysis for any URL. Zero storage. Complete privacy.",
    images: ["/logo/og-image.png"],
    creator: "@caseinn",
  },
  icons: {
    icon: [
      { url: "/logo/favicon.ico", sizes: "any" },
      { url: "/logo/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/logo/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/logo/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      { url: "/logo/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/logo/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
  },
  manifest: "/logo/site.webmanifest",
  alternates: {
    canonical: "https://sentinel.security",
  },
  category: "Security",
};

export const viewport: Viewport = {
  themeColor: "#0F1115",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "Sentinel",
              "applicationCategory": "SecurityApplication",
              "operatingSystem": "Web",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD",
              },
              "description": "Stateless security scanner for modern web applications. Find leaked secrets, misconfigured headers, and vulnerabilities.",
              "url": "https://sentinel.security",
              "author": {
                "@type": "Organization",
                "name": "Caseinn",
                "url": "https://caseinn.com",
              },
              "featureList": [
                "Secret Detection",
                "Security Header Analysis",
                "Cookie Security Analysis",
                "Mixed Content Detection",
                "JavaScript Security Analysis",
                "SRI Validation",
                "GraphQL Introspection Detection",
                "Technology Fingerprinting",
              ],
            }),
          }}
        />
      </head>
      <body className={jetbrainsMono.variable}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
