'use client';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { BrainCircuit, FileQuestion, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { Badge } from './ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

type HistoryDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
};

// Dummy data for now
const historyItems = [
    { id: '1', title: 'Physics - Chapter 4: Magnetism', type: 'prediction', date: '2 days ago' },
    { id: '2', title: 'NEET Biology Mock Test', type: 'quiz', date: '3 days ago' },
    { id: '3', title: 'Chemistry - Organic Compounds', type: 'prediction', date: '5 days ago' },
    { id: '4', title: 'PSC General Knowledge', type: 'quiz', date: '1 week ago' },
];

export function HistoryDrawer({ isOpen, onClose }: HistoryDrawerProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="flex flex-col p-0 w-full sm:max-w-md">
        <SheetHeader className="p-6 pb-4 text-left border-b">
          <SheetTitle>Activity History</SheetTitle>
          <SheetDescription>
            Review, edit, or delete your past predictions and quizzes.
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1">
            <div className="p-6 space-y-4">
                {historyItems.map((item) => (
                    <div key={item.id} className="p-3 rounded-lg border bg-card/50 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-3 overflow-hidden">
                           <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                                {item.type === 'prediction' ? (
                                    <BrainCircuit className="h-5 w-5 text-muted-foreground" />
                                ) : (
                                    <FileQuestion className="h-5 w-5 text-muted-foreground" />
                                )}
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-sm font-semibold truncate">{item.title}</p>
                                <p className="text-xs text-muted-foreground">{item.date}</p>
                            </div>
                        </div>
                        <div className='flex items-center gap-1'>
                             <Badge variant={item.type === 'prediction' ? 'secondary' : 'outline'} className="capitalize flex-shrink-0">
                                {item.type}
                            </Badge>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem>
                                        <Pencil className="mr-2 h-4 w-4" />
                                        <span>Rename</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="text-destructive">
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        <span>Delete</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                ))}
            </div>
        </ScrollArea>
        <div className="p-6 border-t text-center">
            <p className="text-xs text-muted-foreground">End of history.</p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
