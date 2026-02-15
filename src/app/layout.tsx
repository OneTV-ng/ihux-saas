import "./globals.css";
import Footer from "@/components/landing/footer";
import type { Metadata } from "next";
import { Toaster as HotToaster } from "react-hot-toast";
import { Toaster } from "@/components/ui/sonner";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { AlertProvider } from "@/contexts/alert-context";
import { AuthProvider } from "@/contexts/auth-context";
import { AlertContainer } from "@/components/ui/alert-bubble";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DXL Music HUB",
  description: "A Next.js boilerplate for building web applications",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <body className={`${inter.variable} antialiased bg-background`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <AlertProvider>
              {children}
              {/* Branded Footer */}
              <Footer />
              <AlertContainer />
              <HotToaster />
              <Toaster />
            </AlertProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
