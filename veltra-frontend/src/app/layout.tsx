import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Veltra - AI Running Coach",
  description: "Seu coach de corrida com inteligência artificial",
  icons: { icon: "/images/favicon.svg" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
