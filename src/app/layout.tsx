import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import ThemeRegistry from "@/theme/ThemeRegistry";
import { Roboto } from "next/font/google";
import { PreferencesProvider } from "@/theme/PreferencesContext";
import RegisterServiceWorker from "@/components/RegisterServiceWorker";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata = {
  title: "Home Manager App",
  description: "Simplify your home life",
  icons: {
    icon: "/logo-home-manager.webp", // You can also use /logo.png or other image
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" className={roboto.className}>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/logo-home-manager.webp" type="image/webp" />
          <link rel="manifest" href="/manifest.json" />
          <meta name="theme-color" content="#1976d2" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta
            name="apple-mobile-web-app-status-bar-style"
            content="default"
          />
          <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        </head>
        <body suppressHydrationWarning>
          <ThemeRegistry>
            <PreferencesProvider>
              <RegisterServiceWorker />
              {children}
            </PreferencesProvider>
          </ThemeRegistry>
        </body>
      </html>
    </ClerkProvider>
  );
}
