import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Pokemon Shakespeare Web App",
  description:
    "A simple Pokemon app with Shakespearean translation descriptions.",
};

/**
 * Root layout component.
 *
 * @param props - Layout props
 * @param props.children - Child components/pages
 * @returns Root HTML structure
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={poppins.variable}>
      <body className={`${poppins.className} antialiased`}>{children}</body>
    </html>
  );
}
