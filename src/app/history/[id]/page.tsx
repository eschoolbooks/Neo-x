'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useDoc, useUser, useMemoFirebase } from '@/firebase';
import { useFirestore } from '@/firebase/provider';
import { doc, DocumentData } from 'firebase/firestore';
import { LoaderCircle, ArrowLeft, BrainCircuit, GraduationCap, Lightbulb, CheckCircle, BookCheck, Info, X, FileQuestion } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { Quiz, QuizQuestion } from '@/ai/flows/generateQuizSchemas';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';


type Prediction = {
    topic: string;
    details: string;
    confidence: number;
    tags: string[];
}

type PredictedQuestion = {
    question: string;
    answer: string;
}

type AnalysisDoc = {
    session: {
        exam_type: string;
    };
    predictions: Prediction[];
    predictedQuestions: PredictedQuestion[];
    study_recommendations: {
        recommendations: string[];
    };
};

type QuizDoc = {
    title: string;
    questions: string; // This is a JSON string
};


export default function HistoryPage() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const type = searchParams.get('type');
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const historyDocRef = useMemoFirebase(() => {
    if (!user || !id || !type || !firestore) return null;
    const collectionName = type === 'analysis' ? 'analyses' : 'quizzes';
    return doc(firestore, 'users', user.uid, collectionName, id as string);
  }, [user, id, type, firestore]);

  const { data, isLoading, error } = useDoc<DocumentData>(historyDocRef);
  
  const [parsedQuiz, setParsedQuiz] = useState<Quiz | null>(null);

  useEffect(() => {
    if (data && type === 'quiz') {
      try {
        const quizData = data as QuizDoc;
        setParsedQuiz({
            title: quizData.title,
            questions: JSON.parse(quizData.questions)
        });
      } catch (e) {
        console.error("Failed to parse quiz questions:", e);
      }
    }
  }, [data, type]);
  
  if (isLoading || isUserLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <LoaderCircle className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center">
        <h2 className="text-xl font-semibold text-destructive">Error</h2>
        <p className="text-muted-foreground">Could not load the history item.</p>
        <p className='text-xs text-muted-foreground mt-2'>{error.message}</p>
        <Button asChild variant="link" className="mt-4"><Link href="/ai-hub">Back to AI Hub</Link></Button>
      </div>
    );
  }

  if (!data) {
     return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center">
        <h2 className="text-xl font-semibold">Not Found</h2>
        <p className="text-muted-foreground">The requested history item could not be found.</p>
        <Button asChild variant="link" className="mt-4"><Link href="/ai-hub">Back to AI Hub</Link></Button>
      </div>
    );
  }

  const analysisData = data as AnalysisDoc;

  return (
    <main className="flex-1 py-10 lg:py-16">
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
                <Button asChild variant="outline">
                    <Link href="/ai-hub">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to AI Hub
                    </Link>
                </Button>
            </div>
            
            <Card className="shadow-lg overflow-hidden">
                 <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-3 text-2xl">
                            <BrainCircuit className="text-primary"/>
                            {type === 'analysis' ? `Prediction for ${analysisData.session?.exam_type}` : parsedQuiz?.title}
                        </CardTitle>
                        <CardDescription>
                            Reviewing a past session.
                        </CardDescription>
                      </div>
                    </div>
                </CardHeader>

                <CardContent>
                    {type === 'analysis' && (
                        <div className="space-y-8">
                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <h3 className="font-bold text-xl flex items-center gap-2"><GraduationCap/> Predicted Key Topics</h3>
                                    <div className="space-y-4">
                                        {analysisData.predictions?.map((item, index) => (
                                            <Card key={index} className="bg-background">
                                                <CardHeader className='pb-2'>
                                                    <CardTitle className="text-lg">{item.topic}</CardTitle>
                                                    <CardDescription>{item.details}</CardDescription>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className='flex items-center gap-2'>
                                                        <Progress value={item.confidence || 0} className="h-2" />
                                                        <span className="font-semibold text-sm text-right min-w-[40px]">{item.confidence || 0}%</span>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <h3 className="font-bold text-xl flex items-center gap-2"><Lightbulb/> Study Recommendations</h3>
                                    <ul className="space-y-3">
                                        {analysisData.study_recommendations?.recommendations.map((rec, index) => (
                                            <li key={index} className="flex items-start gap-3">
                                                <CheckCircle className="h-5 w-5 text-accent mt-1 flex-shrink-0" />
                                                <span className="text-muted-foreground">{rec}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                             {analysisData.predictedQuestions && analysisData.predictedQuestions.length > 0 && (
                                <div className="space-y-4">
                                    <h3 className="font-bold text-xl flex items-center gap-2"><FileQuestion/> Predicted Questions & Answers</h3>
                                     <Accordion type="single" collapsible className="w-full space-y-2">
                                        {analysisData.predictedQuestions.map((qa, index) => (
                                            <AccordionItem value={`item-${index}`} key={index} className="bg-background rounded-lg border px-4">
                                                <AccordionTrigger className="text-left hover:no-underline">{qa.question}</AccordionTrigger>
                                                <AccordionContent className="text-muted-foreground pt-2">
                                                    {qa.answer}
                                                </AccordionContent>
                                            </AccordionItem>
                                        ))}
                                    </Accordion>
                                </div>
                            )}
                        </div>
                    )}
                    
                    {type === 'quiz' && parsedQuiz && (
                         <div className="space-y-6 pt-6">
                            <h4 className="text-xl font-bold flex items-center gap-2"><BookCheck/> Quiz Questions & Explanations</h4>
                            {parsedQuiz.questions.map((q, index) => (
                                <Card key={index} className="bg-background">
                                    <CardHeader>
                                        <CardTitle className="text-lg">Question {index + 1}: {q.questionText}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="space-y-2">
                                            {q.options.map((option, i) => {
                                                const isTheCorrectAnswer = q.correctAnswer === option;
                                                return (
                                                    <div 
                                                        key={i}
                                                        className={cn(
                                                            "flex items-center space-x-2 p-3 rounded-md border text-sm",
                                                            isTheCorrectAnswer ? "bg-accent/10 border-accent/50 text-accent-foreground" : "bg-muted/50"
                                                        )}
                                                    >
                                                        {isTheCorrectAnswer ? <CheckCircle className="h-4 w-4 text-accent"/> : <div className='w-4 h-4'/>}
                                                        <span>{option}</span>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                        <Alert className='bg-accent/10 border-accent/50'>
                                            <Info className="h-4 w-4" />
                                            <AlertTitle>Explanation</AlertTitle>
                                            <AlertDescription>
                                                {q.explanation}
                                            </AlertDescription>
                                        </Alert>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    </main>
  );
}
