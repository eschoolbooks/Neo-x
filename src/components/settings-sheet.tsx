'use client';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from './ui/button';
import { ThemeToggle } from './theme-toggle';
import { Separator } from './ui/separator';
import { useUser } from '@/firebase';
import { LifeBuoy, LogOut, FileText, Heart, BrainCircuit, Github, Bug, Lightbulb, User } from 'lucide-react';
import Link from 'next/link';
import { ScrollArea } from './ui/scroll-area';
import { cn } from '@/lib/utils';

type SettingsSheetProps = {
  isOpen: boolean;
  onClose: () => void;
  onSignOut: () => void;
};

export function SettingsSheet({ isOpen, onClose, onSignOut }: SettingsSheetProps) {
  const { user } = useUser();

  const handleSignOut = () => {
    onClose();
    onSignOut();
  };

  const SettingItem = ({ href, icon, children }: { href: string, icon: React.ReactNode, children: React.ReactNode }) => (
    <Button variant="ghost" className="w-full justify-start gap-2" asChild>
      <Link href={href}>
        {icon}
        {children}
      </Link>
    </Button>
  );

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="flex flex-col p-0">
        <SheetHeader className="p-6 pb-4">
          <SheetTitle>Settings</SheetTitle>
          <SheetDescription>
            Manage your preferences and access app information.
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="flex-1 px-6">
          <div className="space-y-6">
            <div className='space-y-2'>
              <h3 className="px-2 text-xs font-semibold text-muted-foreground uppercase">General</h3>
              <div className="flex items-center justify-between rounded-md p-2 hover:bg-accent hover:text-accent-foreground">
                  <div className="flex items-center gap-2">
                    <SunMoonIcon />
                    <span className="text-sm font-medium">Theme</span>
                  </div>
                  <ThemeToggle />
              </div>
              <SettingItem href="/donate" icon={<Heart />}>Donate to Support</SettingItem>
              <SettingItem href="/upload-qn" icon={<BrainCircuit />}>AI Training Ground</SettingItem>
            </div>
            
            <Separator />

            <div className='space-y-2'>
              <h3 className="px-2 text-xs font-semibold text-muted-foreground uppercase">About & Help</h3>
              <SettingItem href="#" icon={<FileText />}>Terms & Conditions</SettingItem>
              <SettingItem href="#" icon={<FileText />}>Privacy Policy</SettingItem>
              <SettingItem href="#" icon={<Lightbulb />}>Suggest a Feature</SettingItem>
              <SettingItem href="#" icon={<Bug />}>Report a Bug</SettingItem>
              <SettingItem href="#" icon={<Github />}>Source Code</SettingItem>
            </div>
          </div>
        </ScrollArea>

        <SheetFooter className="flex-col !space-x-0 items-start space-y-4 border-t p-6">
          <div className="text-xs text-muted-foreground space-y-1">
            <p>Version: 0.1.0 (Beta)</p>
            <p>
              A part of the <a href="https://varts.org" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">varts.org</a> initiative.
            </p>
            <p>Contact: <a href="mailto:info@e-schoolbooks.in" className="underline hover:text-primary">info@e-schoolbooks.in</a></p>
          </div>
          <Button variant="outline" className="w-full" onClick={handleSignOut}>
            <LogOut />
            Sign Out
          </Button>
           {user && (
            <div className="flex w-full items-center gap-2 border-t pt-4 text-xs text-muted-foreground">
                <User className="h-4 w-4"/>
                <span className='truncate'>User ID: {user.uid}</span>
            </div>
           )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

// A simple helper for the icon in the theme toggle row
function SunMoonIcon() {
    return (
        <div className="relative h-4 w-4">
            <Lightbulb className="absolute transition-all scale-100 dark:scale-0"/>
            <Lightbulb className="absolute transition-all scale-0 dark:scale-100"/>
        </div>
    )
}
