import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  metadataBase: new URL('https://unmaskai.com'),
  title: 'Unmask AI | Visible AI Watermark Remover & Clean Toolkit',
  description:
    'Mathematically reverse & clean visible AI watermarks from Gemini, Google Veo, Sora, Imagen 3, and CapCut in your browser. 100% private, local canvas processing.',
  keywords: [
    'gemini watermark remover',
    'veo watermark remover',
    'sora watermark remover',
    'ai watermark remover',
    'remove ai watermark online',
    'reverse alpha blending watermark',
    'imagen watermark remover',
  ],
  authors: [{ name: 'Unmask AI Team' }],
  openGraph: {
    title: 'Unmask AI - Universal AI Watermark Remover Toolkit',
    description:
      'Fast, local in-browser visible AI watermark removal for Google Gemini, Veo, Sora, and Imagen. No uploads, zero loss in quality.',
    url: 'https://unmaskai.com',
    siteName: 'Unmask AI',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Unmask AI - Visible AI Watermark Remover Toolkit',
    description: 'Clean visible AI overlays locally in your browser with mathematical reverse alpha blending.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background text-foreground antialiased selection:bg-cyanGlow/30 selection:text-cyan-200">
        {/* Background glow effects */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-brand-600/15 via-cyanGlow/10 to-transparent blur-3xl opacity-60" />
        </div>

        <div className="relative z-10 flex min-h-screen flex-col justify-between">
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
