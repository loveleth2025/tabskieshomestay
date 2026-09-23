import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://tabskieshomestay.vercel.app"),
  title: "Tabskie's Homestay and Travel",
  description: "Book Bamboo Unit, Lower Unit, or the Whole House in Camiguin.",
  openGraph: {
    title: "Tabskie's Homestay and Travel",
    description: "Book Bamboo Unit, Lower Unit, or the Whole House in Camiguin.",
    url: "https://tabskieshomestay.vercel.app",
    siteName: "Tabskie's Homestay and Travel",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tabskie's Homestay and Travel",
    description: "Book Bamboo Unit, Lower Unit, or the Whole House in Camiguin.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Newsreader:ital,wght@0,500;0,600;1,500;1,600&family=Work+Sans:wght@400;500;600;700&display=swap"
        />
      </head>
      <body className="font-body bg-sand text-ink antialiased">
        {children}
      </body>
    </html>
  );
}
