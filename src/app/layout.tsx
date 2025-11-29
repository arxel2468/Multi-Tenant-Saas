import "./globals.css";
import Providers from "@/components/providers";
import { Toaster } from "@/components/ui/sonner";

export const metadata = {
  title: "YourSaaS - The OS for High-Performing Teams",
  description: "Manage tasks, invite your team, and ship faster. Built for speed.",
  openGraph: {
    title: "YourSaaS - The OS for High-Performing Teams",
    description: "Manage tasks, invite your team, and ship faster.",
    url: 'https://multi-tenant-saas-phi-indol.vercel.app',
    siteName: 'YourSaaS',
    // images: [
    //   {
    //     url: 'https://live-url.vercel.app/og.png', // We'll make this later
    //     width: 1200,
    //     height: 630,
    //   },
    // ],
    locale: 'en_US',
    type: 'website',
  },
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