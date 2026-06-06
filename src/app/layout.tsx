import type { Metadata } from "next";
import "./globals.css";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { ServiceWorkerRegister } from "@/components/layout/ServiceWorkerRegister";

export const metadata: Metadata = {
  title: "易象 - 现代命理解读",
  description: "基于传统易学智慧，用现代界面呈现每日运势、八字、姻缘、易经与黄历。",
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    shortcut: ["/favicon.svg"],
    apple: [{ url: "/favicon.svg", type: "image/svg+xml" }],
  },
  manifest: "/manifest.json",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="min-h-screen bg-paper text-ink">
        <ThemeProvider>
          <ServiceWorkerRegister />
          <Navbar />
          <main className="mx-auto max-w-4xl px-5 pb-16 sm:px-8">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
