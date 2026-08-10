import type { Metadata } from "next";
import { Inter, DM_Serif_Display } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
});

const dmSerif = DM_Serif_Display({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-dm-serif",
});

export const metadata: Metadata = {
  title: {
    default: "SBN Enterprise – Management System",
    template: "%s | SBN Enterprise",
  },

  description:
    "SBN Enterprise is a comprehensive management system handling customers, billing, expenses, and reports.",

  alternates: {
    canonical: "/",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },

  openGraph: {
    type: "website",
    locale: "en_BD",
    siteName: "SBN Enterprise",
    title: "SBN Enterprise – Management System",
    description:
      "Manage your business with SBN Enterprise - customers, billing, expenses, and reports in one place.",
  },

  twitter: {
    card: "summary_large_image",
    title: "SBN Enterprise – Management System",
    description:
      "Comprehensive management system for customers, billing, expenses, and reports.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${inter.variable} ${dmSerif.variable} font-sans`}
          suppressHydrationWarning
        >
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
