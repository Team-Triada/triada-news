import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const SITE_URL = "https://news.triada.in";
const SITE_NAME = "TRIADA News";
const SITE_DESCRIPTION =
  "Cybersecurity headlines, summarized and enriched with severity, CVE tracking, and KEV cross-referencing. Updated hourly from 30+ sources.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | Cybersecurity Headlines, Summarized`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "cybersecurity news", "threat intelligence", "CVE tracker", "vulnerability news",
    "security advisories", "KEV catalog", "zero-day", "ransomware news",
    "TRIADA", "infosec news aggregator",
  ],
  authors: [{ name: "TRIADA", url: "https://triada.in" }],
  creator: "TRIADA",
  publisher: "TRIADA",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: `${SITE_NAME} | Cybersecurity Headlines, Summarized`,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: "en_US",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: SITE_DESCRIPTION }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@teamtriada",
    title: `${SITE_NAME} | Cybersecurity Headlines, Summarized`,
    description: SITE_DESCRIPTION,
    creator: "@teamtriada",
    images: ["/og-image.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0c0c0e",
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  name: SITE_NAME,
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  inLanguage: "en-US",
  publisher: { "@type": "Organization", "@id": "https://triada.in/#organization" },
};

const newsMediaSchema = {
  "@context": "https://schema.org",
  "@type": "NewsMediaOrganization",
  name: SITE_NAME,
  url: SITE_URL,
  logo: { "@type": "ImageObject", url: `${SITE_URL}/icon.png` },
  parentOrganization: { "@type": "Organization", name: "TRIADA", url: "https://triada.in" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`dark ${inter.variable} h-full antialiased`}>
      <head>
        <link rel="preload" href="/fonts/Telegraf-Regular.woff" as="font" type="font/woff" crossOrigin="anonymous" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(newsMediaSchema) }} />
      </head>
      <body className="min-h-full flex flex-col">
        <Header />
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
