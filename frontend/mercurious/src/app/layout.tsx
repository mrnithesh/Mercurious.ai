import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ClientOnly } from "@/components/ClientOnly";

export const metadata: Metadata = {
  title: "Mercurious AI - Your AI Learning Assistant",
  description: "Transform YouTube videos into interactive learning experiences using cutting-edge AI technology.",
  keywords: "AI, learning, education, YouTube, video processing, study guide, quiz generation",
  authors: [{ name: "Mercurious AI Team" }],
  viewport: "width=device-width, initial-scale=1",
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
            {children}
          </AuthProvider>
        </ClientOnly>
      </body>
    </html>
  );
}
