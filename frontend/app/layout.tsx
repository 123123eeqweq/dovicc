import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Montserrat } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Layout } from "@/components/layout/Layout";
import { ToastProvider } from "@/components/ui/Toast";
import { AuthProvider } from "@/context/AuthContext";
import { AuthGate } from "@/components/auth/AuthGate";
import { NavigationScroll } from "@/components/ui/NavigationScroll";
import { BASE_URL } from "@/lib/constants";

const montserrat = Montserrat({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-montserrat",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "DOVI — Відгуки про все, що важливо",
    template: "%s | DOVI"
  },
  description: "Реальні відгуки про компанії, сервіси та події України. Чесні відгуки для правильних рішень.",
  keywords: ["відгуки", "рейтинг", "компанії України", "відгуки клієнтів", "dovi", "dovi.com.ua"],
  authors: [{ name: "DOVI" }],
  creator: "DOVI",
  publisher: "DOVI",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: '/images/logosimple.png',
    shortcut: '/images/logosimple.png',
    apple: '/images/logosimple.png',
  },
  openGraph: {
    type: 'website',
    locale: 'uk_UA',
    url: BASE_URL,
    siteName: 'DOVI',
    title: 'DOVI — Відгуки про все, що важливо',
    description: 'Реальні відгуки про компанії, сервіси та події України. Чесні відгуки для правильних рішень.',
    images: [
      {
        url: `${BASE_URL}/images/logo.png`,
        width: 1200,
        height: 630,
        alt: 'DOVI — Платформа відгуків',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DOVI — Відгуки про все, що важливо',
    description: 'Реальні відгуки клієнтів про компанії, сервіси, події, медіа та інше',
    images: [`${BASE_URL}/images/logo.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: BASE_URL,
    languages: { 'uk-UA': BASE_URL, 'x-default': BASE_URL },
  },
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uk" className={montserrat.variable} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://accounts.google.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="preload" href="/images/logo.png" as="image" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'DOVI',
              url: BASE_URL,
              description: 'Платформа відгуків про компанії, сервіси, події та медіа України',
              potentialAction: {
                '@type': 'SearchAction',
                target: {
                  '@type': 'EntryPoint',
                  urlTemplate: `${BASE_URL}/search?q={search_term_string}`,
                },
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'DOVI',
              url: BASE_URL,
              logo: `${BASE_URL}/images/logo.png`,
              description: 'Платформа відгуків про компанії, сервіси, події та медіа України',
            }),
          }}
        />
      </head>
      <body className={montserrat.className} suppressHydrationWarning>
        <AuthProvider>
          <ToastProvider>
            <Suspense fallback={null}>
              <NavigationScroll />
            </Suspense>
            <Layout>{children}</Layout>
            <AuthGate />
          </ToastProvider>
        </AuthProvider>
        <Script
          src="https://accounts.google.com/gsi/client"
          strategy="afterInteractive"
        />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-LFML78H1S2"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-LFML78H1S2');
          `}
        </Script>
      </body>
    </html>
  );
}
