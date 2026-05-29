import type { Metadata } from "next";
import { Playfair_Display, DM_Sans, DM_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-dm-sans",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-dm-mono",
});

export const metadata: Metadata = {
  title: "Rylee's IEP Practice — Workspace Dashboard",
  description: "Private-pay IEP advocacy practice workspace.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#D4A84B",
          colorText: "#1C1A15",
          colorBackground: "#FFFEFB",
          colorInputBackground: "#FFFEFB",
          borderRadius: "8px",
          fontFamily: "var(--font-dm-sans)",
        },
      }}
    >
      <html
        lang="en"
        className={`${playfair.variable} ${dmSans.variable} ${dmMono.variable}`}
      >
        <body className="min-h-dvh">
          <TooltipProvider>{children}</TooltipProvider>
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
