import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Toaster } from "@/components/ui/sonner";
import { AutoLogout } from "@/components/AutoLogout";
import { ScrollToTop } from "@/components/ScrollToTop";

const manrope = localFont({
  src: "./fonts/manrope-latin.woff2",
  variable: "--font-manrope",
  weight: "200 800",
  display: "swap",
});

const nunito = localFont({
  src: [
    { path: "./fonts/nunito-800.ttf", weight: "800" },
    { path: "./fonts/nunito-900.ttf", weight: "900" },
  ],
  variable: "--font-nunito",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Anim'Média La Guerche",
    template: "%s | Anim'Média",
  },
  description: "Découvrez nos événements et ateliers culturels : tricot, lecture, écriture, généalogie, informatique et bien plus encore !",
  icons: {
    icon: "/anim-media/icon.png",
    apple: "/anim-media/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${manrope.variable} ${nunito.variable} antialiased`}>
        <AuthProvider>
          <ScrollToTop />
          <Navbar />
          <AutoLogout inactivityTimeout={30 * 60 * 1000} />
          <main>{children}</main>
          <Footer />
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
