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
        <ScrollArea className="flex-1">
            <div className="p-6">
                <SheetHeader className="text-left pb-4">
                  <SheetTitle>Settings</SheetTitle>
                  <SheetDescription>
                    Manage your preferences and access app information.
                  </SheetDescription>
                </SheetHeader>
                <div className="space-y-6">
                    <div className='space-y-2'>
                        <h3 className="px-2 text-xs font-semibold text-muted-foreground uppercase">General</h3>
                        <div className="flex items-center justify-between rounded-md p-2 hover:bg-accent hover:text-accent-foreground">
                            <div className="flex items-center gap-2">
                                <Lightbulb className="h-4 w-4" />
                                <span className="text-sm font-medium">Theme</span>
                            </div>
                            <ThemeToggle />
                        </div>
                        <SettingItem href="/donate" icon={<Heart className="h-4 w-4" />}>Donate to Support</SettingItem>
                        <SettingItem href="/upload-qn" icon={<BrainCircuit className="h-4 w-4" />}>AI Training Ground</SettingItem>
                    </div>
                    
                    <Separator />

                    <div className='space-y-2'>
                        <h3 className="px-2 text-xs font-semibold text-muted-foreground uppercase">About & Help</h3>
                        <SettingItem href="#" icon={<FileText className="h-4 w-4" />}>Terms & Conditions</SettingItem>
                        <SettingItem href="#" icon={<FileText className="h-4 w-4" />}>Privacy Policy</SettingItem>
                        <SettingItem href="#" icon={<Lightbulb className="h-4 w-4" />}>Suggest a Feature</SettingItem>
                        <SettingItem href="#" icon={<Bug className="h-4 w-4" />}>Report a Bug</SettingItem>
                        <SettingItem href="#" icon={<Github className="h-4 w-4" />}>Source Code</SettingItem>
                    </div>
                    
                    <Separator />
                    
                     <div className='space-y-2'>
                         <Button variant="destructive" className="w-full justify-start gap-2" onClick={handleSignOut}>
                            <LogOut className="h-4 w-4"/>
                            Sign Out
                          </Button>
                     </div>
                </div>
            </div>
            <SheetFooter className="p-6 pt-0 text-left border-t mt-6">
                <div className="text-xs text-muted-foreground space-y-2">
                    <p>Version: 0.1.0 (Beta)</p>
                    <p>
                    A part of the <a href="https://varts.org" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">varts.org</a> initiative.
                    </p>
                    <p>Contact: <a href="mailto:info@e-schoolbooks.in" className="underline hover:text-primary">info@e-schoolbooks.in</a></p>
                    {user && (
                        <div className="flex items-center gap-2 pt-2">
                            <User className="h-4 w-4"/>
                            <span className='truncate'>User ID: {user.uid}</span>
                        </div>
                    )}
                </div>
            </SheetFooter>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
