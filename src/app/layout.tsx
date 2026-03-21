import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "MANEL TERMINAL | Trading Competition",
  description: "Compete with simulated trading on Polymarket",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen font-mono">{children}</body>
    </html>
  )
}
