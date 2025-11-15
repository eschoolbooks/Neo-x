import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { FirebaseClientProvider } from '@/firebase';
import { ThemeProvider } from '@/components/theme-provider';
import Analytics from '@/components/analytics';

export const metadata: Metadata = {
  title: 'E-SchoolBooks | Revolutionizing Education for a Brighter Future',
  description: 'E-SchoolBooks is an NGO project dedicated to providing free digital textbooks, reducing students\' back pain, saving trees, and creating an innovative learning ecosystem.',
  icons: {
    icon: [
      { url: '/NeoX_Logo_Dark.svg', media: '(prefers-color-scheme: dark)' },
      { url: '/NeoX_Logo_Light.svg', media: '(prefers-color-scheme: light)' },
    ],
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" style={{ scrollBehavior: 'smooth' }} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-background min-h-screen">
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
            <FirebaseClientProvider>
                {children}
            </FirebaseClientProvider>
            <Toaster />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
