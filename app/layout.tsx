import type { Metadata } from "next";
import { Geist } from "next/font/google"; // Geist_Mono can be removed if not used as the default mono font
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// If you want to use Geist Mono for `<code>` or `<pre>` tags, you can keep this
// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

export const metadata: Metadata = {
  title: "Content Analyzer AI", // Improved title
  description: "Transform your social media content with AI-powered analysis and recommendations.", // Improved description
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* FIX: Added `font-sans` to apply the Geist font variable as the default. 
        Removed geistMono unless you plan to apply `font-mono` specifically.
      */}
      <body className={`${geistSans.variable} font-sans antialiased isolate text-[105%] md:text-[115%] lg:text-[130%] xl:text-[140%]`}>
        {children}
      </body>
    </html>
  );
}