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
import { BrainCircuit, FileQuestion, MoreVertical, Pencil, Trash2, History, ChevronRight } from 'lucide-react';
import { Badge } from './ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { useCollection, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, Timestamp } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import { Skeleton } from './ui/skeleton';
import { useRouter } from 'next/navigation';

type HistoryDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
};

// Represents the structure of an analysis document in Firestore
type AnalysisHistoryItem = {
    id: string;
    session: {
        exam_type: string;
        prediction_date: string;
    };
    // This is for older prediction documents
    analysisDate?: Timestamp;
};

type QuizHistoryItem = {
    id: string;
    title: string;
    createdAt: Timestamp;
}

export function HistoryDrawer({ isOpen, onClose }: HistoryDrawerProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  const analysesQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(
        collection(firestore, 'users', user.uid, 'analyses'), 
        orderBy('meta.timestamp', 'desc')
    );
  }, [user, firestore]);
  
  const quizzesQuery = useMemoFirebase(() => {
      if (!user || !firestore) return null;
      return query(
          collection(firestore, 'users', user.uid, 'quizzes'),
          orderBy('createdAt', 'desc')
      );
  }, [user, firestore]);

  const { data: analyses, isLoading: isLoadingAnalyses } = useCollection<AnalysisHistoryItem>(analysesQuery);
  const { data: quizzes, isLoading: isLoadingQuizzes } = useCollection<QuizHistoryItem>(quizzesQuery);
  
  const isLoading = isLoadingAnalyses || isLoadingQuizzes;

  const handleItemClick = (type: 'analysis' | 'quiz', id: string) => {
    router.push(`/history/${id}?type=${type}`);
    onClose();
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="flex flex-col p-0 w-full sm:max-w-md">
        <SheetHeader className="p-6 pb-4 text-left border-b">
          <SheetTitle>Activity History</SheetTitle>
          <SheetDescription>
            Review your past predictions and quizzes.
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
                
                {!isLoading && (!analyses || analyses.length === 0) && (!quizzes || quizzes.length === 0) && (
                    <div className='text-center py-10'>
                        <History className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4"/>
                        <h3 className='font-semibold'>No History Yet</h3>
                        <p className='text-sm text-muted-foreground'>Your generated predictions and quizzes will appear here.</p>
                    </div>
                )}
                
                {!isLoadingQuizzes && quizzes && quizzes.map((item) => (
                    <button key={`quiz-${item.id}`} onClick={() => handleItemClick('quiz', item.id)} className="w-full text-left p-3 rounded-lg border bg-card/50 flex items-center justify-between gap-2 hover:bg-muted transition-colors">
                        <div className="flex items-center gap-3 overflow-hidden">
                           <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                                <FileQuestion className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-sm font-semibold truncate">{item.title}</p>
                                <p className="text-xs text-muted-foreground">{new Date(item.createdAt?.toDate()).toLocaleString()}</p>
                            </div>
                        </div>
                        <div className='flex items-center gap-1'>
                             <Badge variant='outline' className="capitalize flex-shrink-0">
                                Quiz
                            </Badge>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                    </button>
                ))}

                {!isLoadingAnalyses && analyses && analyses.map((item) => (
                    <button key={`analysis-${item.id}`} onClick={() => handleItemClick('analysis', item.id)} className="w-full text-left p-3 rounded-lg border bg-card/50 flex items-center justify-between gap-2 hover:bg-muted transition-colors">
                        <div className="flex items-center gap-3 overflow-hidden">
                           <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                                <BrainCircuit className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-sm font-semibold truncate">Prediction for {item.session?.exam_type}</p>
                                <p className="text-xs text-muted-foreground">{item.session?.prediction_date}</p>
                            </div>
                        </div>
                        <div className='flex items-center gap-1'>
                             <Badge variant='secondary' className="capitalize flex-shrink-0">
                                Prediction
                            </Badge>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                    </button>
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
