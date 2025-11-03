'use client';

import { AiHub } from '@/components/ai-hub';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import Image from 'next/image';

export default function AiHubPage() {
  return (
      <div className="bg-background text-foreground min-h-screen">
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/20">
          <nav className="flex items-center justify-between h-20 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4">
              <a href="/" className="flex items-center gap-2">
                <Image src="https://media.licdn.com/dms/image/v2/D4E0BAQETuF_JEMo6MQ/company-logo_200_200/company-logo_200_200/0/1685716892227?e=2147483647&v=beta&t=vAW_vkOt-KSxA9tSNdgNszeTgz9l_UX0nkz0S_jDSz8" alt="E-SchoolBooks Logo" width={40} height={40} className="rounded-full"/>
                <span className="font-bold text-xl text-foreground">E-SchoolBooks</span>
              </a>
            </div>
            <div className="hidden md:flex items-center gap-8">
               <a href="/" className="hover:text-primary transition-colors">Home</a>
               <a href="/donate" className="hover:text-primary transition-colors">Donate</a>
            </div>
            <Button asChild className="rounded-full">
              <a href="#">
                Sign In
              </a>
            </Button>
          </nav>
        </header>
        <main className="flex-1 py-10 lg:py-16">
            <AiHub isDemo={false} />
        </main>
      </div>
  );
}
