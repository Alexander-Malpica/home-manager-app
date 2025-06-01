import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import ThemeRegistry from "@/theme/ThemeRegistry";
import { Roboto } from "next/font/google"; // ✅ Import font

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
    <ClerkProvider appearance={{}}>
      <html lang="en" className={roboto.className} suppressHydrationWarning>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          {/* <meta name="emotion-insertion-point" content="" /> */}
          <link rel="icon" href="/logo-home-manager.webp" type="image/webp" />
        </head>
        <body>
          <ThemeRegistry>{children}</ThemeRegistry>
        </body>
      </html>
    </ClerkProvider>
  );
}
