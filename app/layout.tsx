import type React from "react"
import type { Metadata, Viewport } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { ThemeProvider } from "@/components/theme-provider"
import { ErrorBoundary } from "@/components/error-boundary"
import "./globals.css"

export const metadata: Metadata = {
  title: "Nelson-GPT",
  description: "AI-Powered Pediatric Medical Assistant",
  generator: "Nelson-GPT",
  applicationName: "Nelson-GPT",
  referrer: "origin-when-cross-origin",
  keywords: ["pediatrics", "medical", "AI", "assistant", "Nelson", "textbook"],
  authors: [{ name: "Nelson-GPT Team" }],
  creator: "Nelson-GPT",
  publisher: "Nelson-GPT",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://nelson-gpt.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Nelson-GPT",
    description: "AI-Powered Pediatric Medical Assistant",
    url: "https://nelson-gpt.vercel.app",
    siteName: "Nelson-GPT",
    locale: "en_US",
    type: "website",
  },
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
  manifest: "/manifest.json",
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#1e1e1e" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/icon-192.png" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('[SW] Registration successful:', registration.scope);
                    })
                    .catch(function(error) {
                      console.log('[SW] Registration failed:', error);
                    });
                });
              }
            `,
          }}
        />
      </head>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <ErrorBoundary
          onError={(error, errorInfo) => {
            // Log errors to console in development
            if (process.env.NODE_ENV === 'development') {
              console.error('[Root ErrorBoundary] Application error:', error)
              console.error('[Root ErrorBoundary] Error info:', errorInfo)
            }
            
            // In production, you would send this to your error monitoring service
            if (process.env.NODE_ENV === 'production') {
              // Example: Send to error monitoring service
              console.error('[Root ErrorBoundary] Production error logged')
            }
          }}
        >
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            {children}
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
