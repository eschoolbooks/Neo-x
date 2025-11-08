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
import { BrainCircuit, FileQuestion, MoreVertical, Pencil, Trash2, History } from 'lucide-react';
import { Badge } from './ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { useCollection, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import { Skeleton } from './ui/skeleton';

type HistoryDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
};

// Represents the structure of an analysis document in Firestore
type AnalysisHistoryItem = {
    id: string;
    analysisDate: string; // Assuming it's an ISO string
    // Add other fields from your Analysis entity if needed
};

export function HistoryDrawer({ isOpen, onClose }: HistoryDrawerProps) {
  const { user } = useUser();
  const firestore = useFirestore();

  const analysesQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    // Query to get the user's analyses, ordered by date descending
    return query(
        collection(firestore, 'users', user.uid, 'analyses'), 
        orderBy('analysisDate', 'desc')
    );
  }, [user, firestore]);

  const { data: historyItems, isLoading } = useCollection<AnalysisHistoryItem>(analysesQuery);

  const formatDate = (isoString: string) => {
    try {
        return new Date(isoString).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    } catch (e) {
        return "Invalid Date";
    }
  };

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
                {isLoading && (
                    <>
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-16 w-full" />
                    </>
                )}
                {!isLoading && historyItems && historyItems.length > 0 && (
                    historyItems.map((item) => (
                    <div key={item.id} className="p-3 rounded-lg border bg-card/50 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-3 overflow-hidden">
                           <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                                <BrainCircuit className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-sm font-semibold truncate">Prediction - {formatDate(item.analysisDate)}</p>
                                <p className="text-xs text-muted-foreground">{new Date(item.analysisDate).toLocaleTimeString()}</p>
                            </div>
                        </div>
                        <div className='flex items-center gap-1'>
                             <Badge variant='secondary' className="capitalize flex-shrink-0">
                                Prediction
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
                )))}
                 {!isLoading && (!historyItems || historyItems.length === 0) && (
                    <div className='text-center py-10'>
                        <History className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4"/>
                        <h3 className='font-semibold'>No History Yet</h3>
                        <p className='text-sm text-muted-foreground'>Your generated predictions and quizzes will appear here.</p>
                    </div>
                )}
            </div>
        </ScrollArea>
        <div className="p-6 border-t text-center">
            <p className="text-xs text-muted-foreground">End of history.</p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
