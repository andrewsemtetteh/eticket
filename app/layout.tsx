import type { Metadata } from "next";
import { Geist, Geist_Mono, Cormorant_Garamond, Lora } from "next/font/google";
import "./globals.css";
import Shell from "./components/Shell";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-logo-primary",
  subsets: ["latin"],
  weight: ["600", "700"],
});

const lora = Lora({
  variable: "--font-logo-sup",
  subsets: ["latin"],
  style: ["italic"],
});

export const metadata: Metadata = {
  title: "Orà duku – Sitting with the Silence After the Noise",
  description:
    "Invitation-only art experience. E-tickets for a reflective evening of art, conversation, and presence.",
  icons: {
    icon: "/oraduku.png",
    apple: "/oraduku.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${cormorant.variable} ${lora.variable} antialiased h-full bg-[var(--background)] text-[var(--foreground)]`}
        suppressHydrationWarning={true}
      >
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
