
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Heart } from 'lucide-react';
import { useTheme } from 'next-themes';
import Link from 'next/link';

export default function NeoXPage() {
  const { resolvedTheme } = useTheme();
  const [logoSrc, setLogoSrc] = useState('/NeoX_Logo_Light.svg');

  useEffect(() => {
    setLogoSrc(resolvedTheme === 'dark' ? '/NeoX_Logo_Dark.svg' : '/NeoX_Logo_Light.svg');
  }, [resolvedTheme]);

  return (
    <div className="bg-background text-foreground overflow-x-hidden">
        <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/20">
            <nav className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-20">
            <a href="/neox" className="flex items-center gap-2">
                {logoSrc && <Image src={logoSrc} alt="NeoX Logo" width={40} height={40} priority />}
                <span className="font-bold text-xl text-foreground">Neo X</span>
            </a>
            <div className="hidden md:flex items-center gap-8">
                <a href="/" className="hover:text-primary transition-colors">E-SchoolBooks</a>
                <a href="/ai-hub" className="hover:text-primary transition-colors">AI Hub</a>
                <a href="/donate" className="hover:text-primary transition-colors">Donate</a>
            </div>
            <div className="flex items-center gap-4">
                <Button asChild className="rounded-full bg-primary hover:bg-primary/90">
                    <a href="/auth">Get Started <ArrowRight className="ml-2 h-4 w-4" /></a>
                </Button>
            </div>
            </nav>
        </header>

        <main>
            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/20 to-background opacity-50"></div>
                <div className="absolute inset-0 bg-grid-slow"></div>
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,hsl(var(--primary)_/_0.3),rgba(255,255,255,0))]"></div>

                <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                    >
                         {logoSrc && <Image src={logoSrc} alt="NeoX Logo" width={100} height={100} priority className="mx-auto mb-6" />}
                        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tighter text-foreground mb-6">
                            The Future of Studying is Here.<br />Meet <span className="text-primary">Neo X</span>.
                        </h1>
                        <p className="max-w-3xl mx-auto text-lg md:text-xl text-muted-foreground mb-10">
                            Leverage the most powerful and accurate AI exam forecaster to analyze materials, predict key topics, generate quizzes, and chat with an AI tutor.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <Button size="lg" asChild className="rounded-full text-lg px-10 py-6 bg-primary hover:bg-primary/90 text-primary-foreground" variant="default">
                                <a href="/ai-hub">
                                    Launch AI Hub <ArrowRight className="ml-2 h-5 w-5" />
                                </a>
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </section>
        </main>
        
        <footer id="contact" className="py-16 bg-background border-t border-border/20">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                {logoSrc && <Image src={logoSrc} alt="NeoX Logo" width={80} height={80} className="mx-auto mb-4"/>}
                <h2 className="text-2xl font-bold mb-2">Join E-SchoolBooks on This Journey</h2>
                <p className="text-muted-foreground mb-8">
                    Together, we can create a world where education knows no boundaries.
                </p>
                <div className="flex justify-center items-center gap-4 text-sm text-muted-foreground mb-8">
                    <Link href="/terms" className="hover:text-primary">Terms & Conditions</Link>
                    <span>•</span>
                    <Link href="/privacy" className="hover:text-primary">Privacy Policy</Link>
                </div>
                <div className="mt-8 text-sm text-muted-foreground">
                    © {new Date().getFullYear()} E-SchoolBooks Project by Theo. All Rights Reserved.
                </div>
            </div>
        </footer>
    </div>
  );
}
