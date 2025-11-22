import "./globals.css";
import Providers from "@/components/providers";
import { Toaster } from "@/components/ui/sonner";

export const metadata = {
  title: "YourSaaS – Multi-tenant boilerplate",
  description: "Ready for founders",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}