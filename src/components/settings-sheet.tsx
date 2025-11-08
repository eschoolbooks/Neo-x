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
    <Button variant="ghost" className="w-full justify-start" asChild>
      <Link href={href}>
        {icon}
        {children}
      </Link>
    </Button>
  );

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>Settings</SheetTitle>
          <SheetDescription>
            Manage your preferences and access app information.
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 space-y-4 py-4">
          <div className='space-y-1'>
            <h3 className="px-2 text-xs font-semibold text-muted-foreground uppercase">General</h3>
            <div className="flex items-center justify-between px-2">
                <span className="text-sm font-medium">Theme</span>
                <ThemeToggle />
            </div>
            <SettingItem href="/donate" icon={<Heart />}>Donate to Support</SettingItem>
            <SettingItem href="/upload-qn" icon={<BrainCircuit />}>AI Training Ground</SettingItem>
          </div>
          
          <Separator />

          <div className='space-y-1'>
             <h3 className="px-2 text-xs font-semibold text-muted-foreground uppercase">About & Help</h3>
            <SettingItem href="#" icon={<FileText />}>Terms & Conditions</SettingItem>
            <SettingItem href="#" icon={<FileText />}>Privacy Policy</SettingItem>
            <SettingItem href="#" icon={<Lightbulb />}>Suggest a Feature</SettingItem>
            <SettingItem href="#" icon={<Bug />}>Report a Bug</SettingItem>
            <SettingItem href="#" icon={<Github />}>Source Code</SettingItem>
          </div>
        </div>

        <SheetFooter className="flex-col !space-x-0 items-start space-y-4 border-t pt-4">
          <div className="text-xs text-muted-foreground space-y-1 px-2">
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
            <div className="flex items-center gap-2 text-xs text-muted-foreground px-2 pt-2 border-t w-full">
                <User className="h-3 w-3"/>
                <span className='truncate'>User ID: {user.uid}</span>
            </div>
           )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
