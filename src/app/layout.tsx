import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import ThemeRegistry from "@/theme/ThemeRegistry";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <ThemeRegistry>{children}</ThemeRegistry>
        </body>
      </html>
    </ClerkProvider>
  );
}
