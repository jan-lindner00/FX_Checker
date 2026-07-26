import type { Metadata } from "next"
import { JetBrains_Mono } from "next/font/google"
import "@/app/globals.css"
import "@/app/globals.css"

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbarains-mono",
  weight: ["400", "500", "600", "700"]
})


export const metadata: Metadata = {
  icons:{
    icon: ["/icon.png", "/icon2.png", "/icon3.png", "/icon4.png"],
    apple: "/apple-touch-icon.png",
    shortcut: "/favicon.ico"
  },
  title: "FX_Checker",
  description: "A currency converter app that uses live exchange rates and includes a rate-history chart, multi-currency comparison, favorite pairs, and a conversion log.",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${jetBrainsMono.className} h-full antialiased`}
    >
      <body className="min-h-dvh bg-neutral-900">
        {children}
      </body>
    </html>
  );
}
