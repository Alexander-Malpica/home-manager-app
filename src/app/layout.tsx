import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import ThemeRegistry from "@/theme/ThemeRegistry";

export const metadata = {
  title: "Home Manager App",
  description: "Simplify your home life",
  icons: {
    icon: "/logo-home-manager.png", // You can also use /logo.png or other image
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <head>
          <meta name="emotion-insertion-point" content="" />
          <link rel="icon" type="image/png" href="/logo-home-manager.png" />
        </head>
        <body>
          <ThemeRegistry>{children}</ThemeRegistry>
        </body>
      </html>
    </ClerkProvider>
  );
}
