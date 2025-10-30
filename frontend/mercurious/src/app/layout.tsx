import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ToastProvider } from "@/contexts/ToastContext";
import { ClientOnly } from "@/components/ClientOnly";

export const metadata: Metadata = {
  title: "Mercurious AI - Your AI Learning Assistant",
  description: "Transform YouTube videos into interactive learning experiences using cutting-edge AI technology.",
  keywords: "AI, learning, education, YouTube, video processing, study guide, quiz generation, Nithesh, Nithesh K, mrnithesh, Nithesh mercurious, Mercurious AI, AI learning platform, YouTube to study guide, video learning assistant",
  authors: [{ name: "Nithesh K" }],
  viewport: "width=device-width, initial-scale=1",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Mercurious AI - Your AI Learning Assistant",
    description: "Transform YouTube videos into interactive learning experiences using cutting-edge AI technology.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mercurious AI - Your AI Learning Assistant",
    description: "Transform YouTube videos into interactive learning experiences using cutting-edge AI technology.",
  },
  icons: {
    icon: "/favicon.ico",
  },
  themeColor: "#0f172a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <ClientOnly>
          <AuthProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </AuthProvider>
        </ClientOnly>
      </body>
    </html>
  );
}
