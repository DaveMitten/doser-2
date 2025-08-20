import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Doser - The Smartest Cannabis Calculator",
  description:
    "Take control of your cannabis experience with precision dosing, personalized recommendations, and comprehensive tracking—all in one intelligent platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-doser-background text-doser-text min-h-screen`}
      >
        {/* Background Pattern */}
        <div className="fixed inset-0 bg-doser-background">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,197,94,0.1),transparent_50%)]"></div>
        </div>

        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
