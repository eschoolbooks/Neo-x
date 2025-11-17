
'use client';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from './ui/button';
import { ThemeToggle } from './theme-toggle';
import { Separator } from './ui/separator';
import { useUser } from '@/firebase';
import { LogOut, FileText, Heart, BrainCircuit, Bug, Lightbulb, User } from 'lucide-react';
import Link from 'next/link';
import { ScrollArea } from './ui/scroll-area';

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

  const SettingItem = ({ href, icon, children }: { href?: string, icon: React.ReactNode, children: React.ReactNode }) => {
    const content = (
      <Button variant="ghost" className="w-full justify-start gap-3 p-2 h-auto text-sm font-normal">
        <div className="w-4 flex-shrink-0 flex justify-center">{icon}</div>
        {children}
      </Button>
    );

    if (href) {
        return <Link href={href}>{content}</Link>
    }
    return content;
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="flex flex-col p-0">
        <SheetHeader className="p-6 pb-4 text-left border-b">
          <SheetTitle>Settings</SheetTitle>
          <SheetDescription>
            Manage your preferences and access app information.
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1">
            <div className="p-6 space-y-6">
                <div className='space-y-1'>
                    <h3 className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">General</h3>
                    <ThemeToggle />
                    <SettingItem href="/donate" icon={<Heart className="h-4 w-4" />}>Donate to Support</SettingItem>
                    <SettingItem href="/upload-qn" icon={<BrainCircuit className="h-4 w-4" />}>AI Training Ground</SettingItem>
                </div>
                
                <Separator />

                <div className='space-y-1'>
                    <h3 className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">About & Help</h3>
                    <SettingItem href="/terms" icon={<FileText className="h-4 w-4" />}>Terms & Conditions</SettingItem>
                    <SettingItem href="/privacy" icon={<FileText className="h-4 w-4" />}>Privacy Policy</SettingItem>
                    <SettingItem href="#" icon={<Lightbulb className="h-4 w-4" />}>Suggest a Feature</SettingItem>
                    <SettingItem href="#" icon={<Bug className="h-4 w-4" />}>Report a Bug</SettingItem>
                </div>
                
                <Separator />
                
                <div className='space-y-2'>
                    <h3 className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Account</h3>
                    {user && (
                        <div className="flex items-center gap-3 p-2 text-sm text-muted-foreground">
                            <div className="w-4 flex-shrink-0 flex justify-center"><User className="h-4 w-4"/></div>
                            <span className='truncate font-mono text-xs'>ID: {user.uid}</span>
                        </div>
                    )}
                    <Button variant="destructive" className="w-full justify-center gap-2" onClick={handleSignOut}>
                        <LogOut className="h-4 w-4"/>
                        Sign Out
                    </Button>
                </div>
            </div>
        </ScrollArea>

        <div className="p-6 pt-4 text-left border-t">
            <div className="text-xs text-muted-foreground space-y-1">
                <p>Version: 0.1.0 (Beta)</p>
                <p>
                A part of the <a href="https://varts.org" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">varts.org</a> initiative.
                </p>
                <p>Contact: <a href="mailto:info@e-schoolbooks.in" className="underline hover:text-primary">info@e-schoolbooks.in</a></p>
            </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

    