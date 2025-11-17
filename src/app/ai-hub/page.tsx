
'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowRight, BrainCircuit, CheckCircle, Download, FileQuestion, FileUp, GraduationCap, Lightbulb, LoaderCircle, MessageSquare, Plus, Sparkles, TriangleAlert, X, BookCheck, Info, LogOut, Settings, History, File as FileIcon, UploadCloud } from 'lucide-react';
import { predictExam } from '@/ai/flows/predictExamFlow';
import type { PredictExamOutput } from '@/ai/flows/predictExamSchemas';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { Chat } from '@/components/chat';
import { chatWithNeo } from '@/ai/flows/chatFlow';
import type { ChatWithNeoInput } from '@/ai/flows/chatFlowSchemas';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { generateQuiz } from '@/ai/flows/generateQuizFlow';
import type { Quiz } from '@/ai/flows/generateQuizSchemas';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { FirebaseClientProvider, useAuth, useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { SettingsSheet } from '@/components/settings-sheet';
import { HistoryDrawer } from '@/components/history-drawer';
import { doc, setDoc, serverTimestamp, collection } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import { Input } from '@/components/ui/input';
import { useTheme } from 'next-themes';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';


const MAX_DOCUMENTS = 1;
const MAX_FILE_SIZE_MB = 15;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;


function AiHubContent() {
    const [examType, setExamType] = useState('Plus 2');
    const [customExamType, setCustomExamType] = useState('');
    const [documents, setDocuments] = useState<File[]>([]);
    const [documentDataUris, setDocumentDataUris] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();
    const resultsRef = useRef<HTMLDivElement>(null);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [chatHistory, setChatHistory] = useState<{role: 'user' | 'model', content: string}[]>([]);
    const [isChatting, setIsChatting] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [isDraggingOver, setIsDraggingOver] = useState(false);
    
    const [prediction, setPrediction] = useState<PredictExamOutput | null>(null);
    const [quiz, setQuiz] = useState<Quiz | null>(null);

    const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
    const [quizError, setQuizError] = useState<string | null>(null);
    const [numQuestions, setNumQuestions] = useState(5);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState<string[]>([]);
    const [quizScore, setQuizScore] = useState<number | null>(null);
    const [demoUsed, setDemoUsed] = useState(false);
    const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
    const [showUpload, setShowUpload] = useState(true);

    const auth = useAuth();
    const { user } = useUser();
    const router = useRouter();
    const firestore = useFirestore();
    const { resolvedTheme } = useTheme();
    const [logoSrc, setLogoSrc] = useState('/NeoX_Logo_Light.svg');
    const dropZoneRef = useRef<HTMLDivElement>(null);
    const reportContentRef = useRef<HTMLDivElement>(null);


    useEffect(() => {
        setLogoSrc(resolvedTheme === 'dark' ? '/NeoX_Logo_Dark.svg' : '/NeoX_Logo_Light.svg');
    }, [resolvedTheme]);

    const handleDragEvents = (e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    useEffect(() => {
        const dragEnter = (e: DragEvent) => {
            handleDragEvents(e);
            if (e.dataTransfer?.items && e.dataTransfer.items.length > 0) {
                setIsDraggingOver(true);
            }
        };
        const dragLeave = (e: DragEvent) => {
            handleDragEvents(e);
             // A common issue is dragleave firing on child elements.
             // This check ensures we only hide the overlay when leaving the window for real.
            if (e.relatedTarget === null || !dropZoneRef.current?.contains(e.relatedTarget as Node)) {
                setIsDraggingOver(false);
            }
        };
        const drop = (e: DragEvent) => {
            handleDragEvents(e);
            setIsDraggingOver(false);
            if (e.dataTransfer?.files) {
                const artificialEvent = {
                    target: { files: e.dataTransfer.files }
                } as unknown as React.ChangeEvent<HTMLInputElement>;
                handleFileChange(artificialEvent);
            }
        };

        window.addEventListener('dragenter', dragEnter);
        window.addEventListener('dragover', handleDragEvents);
        window.addEventListener('dragleave', dragLeave);
        window.addEventListener('drop', drop);

        return () => {
            window.removeEventListener('dragenter', dragEnter);
            window.removeEventListener('dragover', handleDragEvents);
            window.removeEventListener('dragleave', dragLeave);
            window.removeEventListener('drop', drop);
        };
    }, []);


    const handleSignOut = async () => {
        await signOut(auth);
        toast({ title: 'Signed Out', description: 'You have been successfully signed out.' });
        router.push('/');
    };

    const fileToDataUri = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };
    
    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }


    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > MAX_FILE_SIZE_BYTES) {
            toast({
                title: 'File Too Large',
                description: `The selected file is larger than ${MAX_FILE_SIZE_MB}MB.`,
                variant: 'destructive',
            });
            return;
        }
        
        try {
            const uri = await fileToDataUri(file);
            setDocuments([file]);
            setDocumentDataUris([uri]);
        } catch (error) {
            toast({
                title: 'File Upload Error',
                description: 'Failed to process file. Please try again.',
                variant: 'destructive',
            });
        } finally {
            if (e.target) e.target.value = '';
        }
    };


    const handleRemoveFile = (index: number) => {
        setDocuments(prev => prev.filter((_, i) => i !== index));
        setDocumentDataUris(prev => prev.filter((_, i) => i !== index));
    };
    
    const handleNewPrediction = () => {
        setShowUpload(true);
        setPrediction(null);
        setQuiz(null);
        setDocuments([]);
        setDocumentDataUris([]);
        setQuizScore(null);
        setUserAnswers([]);
        setCurrentQuestionIndex(0);
        setError(null);
    };


    const handleSubmitPrediction = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (documents.length === 0) {
            toast({
                title: 'No files uploaded',
                description: 'Please upload at least one document (textbook or question paper).',
                variant: 'destructive',
            });
            return;
        }
        
        const finalExamType = examType === 'Custom' ? customExamType : examType;

        if (!finalExamType) {
            toast({
                title: 'Exam Type Required',
                description: 'Please select or enter an exam type.',
                variant: 'destructive',
            });
            return;
        }

        if (!user && demoUsed) {
            toast({ title: 'Demo Limit Reached', description: 'Please sign up to continue predicting exams.', variant: 'destructive' });
            return;
        }

        setIsLoading(true);
        setError(null);
        setPrediction(null);
        setQuiz(null);
        setShowUpload(false);


        try {
            const result = await predictExam({
                examType: finalExamType,
                documents: documentDataUris,
            });

            if (user && firestore) {
                const analysisRef = doc(collection(firestore, 'users', user.uid, 'analyses'));
                const predictionDate = new Date();

                 const savedData = {
                    session: {
                        user_id: user.uid,
                        report_id: analysisRef.id,
                        exam_type: finalExamType,
                        subject: result.predictedTopics[0]?.subject || 'Mixed',
                        grade: result.predictedTopics[0]?.grade || 'General',
                        prediction_date: predictionDate.toISOString().split('T')[0],
                        source: "NeoX AI",
                        version: "1.0.0"
                    },
                    predictions: result.predictedTopics.map(p => ({
                        topic: p.topic,
                        details: p.reason,
                        confidence: p.confidence || 0,
                        tags: [p.subject, p.grade]
                    })),
                    predictedQuestions: result.predictedQuestions, // Save new questions
                    study_recommendations: {
                        recommendations: result.studyRecommendations
                    },
                    meta: {
                        ai_generated: true,
                        timestamp: predictionDate.toISOString(),
                        processing_status: "completed"
                    },
                    userId: user.uid, // Ensure userId is at the top level for security rules
                };

                await setDoc(analysisRef, savedData);
            }
            
            setPrediction(result);
            if (!user) setDemoUsed(true);

            setTimeout(() => {
                resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 100);

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setError(errorMessage);
            setShowUpload(true);
            toast({
                title: 'Prediction Failed',
                description: errorMessage,
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerateQuiz = async (e: React.FormEvent) => {
        e.preventDefault();
         
        if (documents.length === 0) {
            toast({
                title: 'No files uploaded',
                description: 'Please upload at least one document.',
                variant: 'destructive',
            });
            return;
        }

        if (!user && demoUsed) {
            toast({ title: 'Demo Limit Reached', description: 'Please sign up to continue generating quizzes.', variant: 'destructive' });
            return;
        }

        setIsGeneratingQuiz(true);
        setQuizError(null);
        setQuiz(null);
        setQuizScore(null);
        setUserAnswers([]);
        setCurrentQuestionIndex(0);
        setShowUpload(false);

        try {
            const result = await generateQuiz({
                numQuestions,
                documents: documentDataUris,
            });

            if (result.questions.length > 0) {
                if (user && firestore) {
                    const quizRef = doc(collection(firestore, 'users', user.uid, 'quizzes'));
                    
                    await setDoc(quizRef, {
                        id: quizRef.id,
                        userId: user.uid,
                        createdAt: serverTimestamp(),
                        numQuestions: numQuestions,
                        title: result.title,
                        questions: JSON.stringify(result.questions),
                    });
                }
                setQuiz(result);
                if (!user) setDemoUsed(true);
                 setTimeout(() => {
                    resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
            } else {
                 setQuizError("The AI couldn't generate a quiz from the provided documents. Try different files.");
                toast({
                    title: 'Quiz Generation Failed',
                    description: "The AI couldn't generate a quiz. Please try different documents.",
                    variant: 'destructive',
                });
                setShowUpload(true);
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unexpected response was received from the server.';
            setQuizError(errorMessage);
            setShowUpload(true);
            toast({
                title: 'Quiz Generation Failed',
                description: errorMessage,
                variant: 'destructive',
            });
        } finally {
            setIsGeneratingQuiz(false);
        }
    };

     const handleAnswerSelect = (answer: string) => {
        const newAnswers = [...userAnswers];
        newAnswers[currentQuestionIndex] = answer;
        setUserAnswers(newAnswers);
    };

    const handleNextQuestion = () => {
        if (quiz && currentQuestionIndex < quiz.questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    const handleFinishQuiz = () => {
        if (!quiz) return;
        let score = 0;
        quiz.questions.forEach((q, index) => {
            if (userAnswers[index] === q.correctAnswer) {
                score++;
            }
        });
        setQuizScore((score / quiz.questions.length) * 100);
    };

    const handleTryAgain = () => {
        setQuiz(null);
        setQuizScore(null);
        setCurrentQuestionIndex(0);
        setUserAnswers([]);
        setShowUpload(true);
        if (!user) setDemoUsed(false);
    };


    const handleChatSubmit = async (query: string) => {
      const newUserMessage = { role: 'user' as const, content: query };
      const newHistory = [...chatHistory, newUserMessage];
      setChatHistory(newHistory);
      setIsChatting(true);

      try {
        const input: ChatWithNeoInput = {
          query,
          history: chatHistory,
          documents: documentDataUris,
        };
        const result = await chatWithNeo(input);
        const newModelMessage = { role: 'model' as const, content: result.response };
        setChatHistory([...newHistory, newModelMessage]);

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
        const errorResponseMessage = { role: 'model' as const, content: `Sorry, I ran into an error: ${errorMessage}`};
        setChatHistory([...newHistory, errorResponseMessage]);
         toast({
            title: 'Chat Error',
            description: errorMessage,
            variant: 'destructive',
        });
      } finally {
        setIsChatting(false);
      }
    }

    const handleDownloadPdf = async () => {
        const reportElement = reportContentRef.current;
        if (!reportElement || !prediction) return;
    
        setIsDownloadingPdf(true);
    
        try {
            const canvas = await html2canvas(reportElement, {
                scale: 2, // Higher scale for better quality
                backgroundColor: resolvedTheme === 'dark' ? '#020817' : '#FFFFFF',
                useCORS: true,
                onclone: (document) => {
                    // This allows us to modify the cloned document before rendering
                    // Here we can ensure dark/light theme styles are applied correctly
                    document.documentElement.setAttribute('class', resolvedTheme || 'light');
                }
            });
    
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
    
            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;
            const ratio = canvasWidth / canvasHeight;
    
            let imgWidth = pdfWidth - 20; // with margin
            let imgHeight = imgWidth / ratio;
    
            // If the image is too high, we need to split it
            const pageHeightWithMargin = pdfHeight - 20;
            let currentHeight = 0;
    
            while (currentHeight < canvasHeight) {
                // Calculate the slice of the canvas to draw
                const sliceHeight = Math.min(canvasHeight - currentHeight, pageHeightWithMargin * (canvasWidth / imgWidth));
                const sliceCanvas = document.createElement('canvas');
                sliceCanvas.width = canvasWidth;
                sliceCanvas.height = sliceHeight;
                const sliceCtx = sliceCanvas.getContext('2d');
    
                if (sliceCtx) {
                    sliceCtx.drawImage(canvas, 0, currentHeight, canvasWidth, sliceHeight, 0, 0, canvasWidth, sliceHeight);
                    const sliceImgData = sliceCanvas.toDataURL('image/png');
                    const sliceImgHeight = (sliceHeight / canvasWidth) * imgWidth;
    
                    if (currentHeight > 0) {
                        pdf.addPage();
                    }
                    pdf.addImage(sliceImgData, 'PNG', 10, 10, imgWidth, sliceImgHeight);
                }
    
                currentHeight += sliceHeight;
            }
            
            const finalExamType = examType === 'Custom' ? customExamType : examType;
            pdf.save(`E-SchoolBooks-Prediction-${finalExamType}-${new Date().toISOString().split('T')[0]}.pdf`);
    
        } catch (error) {
            console.error("Error generating PDF:", error);
            toast({
                title: 'PDF Download Failed',
                description: 'Could not generate PDF. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsDownloadingPdf(false);
        }
    };

    
const FileUploadArea = ({title, files, onFileChange, onRemoveFile}: {title: string, files: File[], onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void, onRemoveFile: (index: number) => void}) => {
    const fileCount = files.length;
    const isLimitReached = fileCount >= MAX_DOCUMENTS;

    return (
        <div className="space-y-2">
            <Label htmlFor="documents-input" className="text-lg font-semibold flex justify-between">
                {title} (PDF) <span>{fileCount} / {MAX_DOCUMENTS}</span>
            </Label>
            <div className="flex items-center justify-center w-full">
                <label 
                    htmlFor="documents-input" 
                    className={cn(`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg transition-colors`,
                        isLimitReached 
                            ? 'bg-destructive/10 border-destructive text-destructive-foreground cursor-not-allowed' 
                            : 'cursor-pointer bg-card/50 hover:bg-muted border-input'
                        )}
                >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        {isLimitReached ? (
                            <>
                                <TriangleAlert className="w-8 h-8 mb-2" />
                                <p className="text-sm font-semibold">You have reached the maximum of {MAX_DOCUMENTS} file.</p>
                            </>
                        ) : (
                            <>
                                <FileUp className="w-8 h-8 mb-2 text-muted-foreground" />
                                <p className="mb-1 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                <p className="text-xs text-muted-foreground">PDF only, up to {MAX_FILE_SIZE_MB}MB</p>
                            </>
                        )}
                    </div>
                    <input id="documents-input" type="file" className="hidden" accept=".pdf" onChange={onFileChange} disabled={isLimitReached} />
                </label>
            </div>
            <div className="space-y-2 pt-2">
                {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between text-sm p-3 bg-muted rounded-lg border gap-3">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <FileIcon className="h-8 w-8 text-muted-foreground flex-shrink-0" />
                            <div className="flex flex-col overflow-hidden">
                                <div className="overflow-hidden whitespace-nowrap">
                                    <span className="font-semibold text-foreground animate-marquee hover:pause">
                                        {file.name}
                                    </span>
                                </div>
                                <span className="text-muted-foreground">{formatFileSize(file.size)}</span>
                            </div>
                        </div>
                        <Button type="button" variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0" onClick={() => onRemoveFile(index)}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                ))}
            </div>
        </div>
    );
}

    
    return (
        <div ref={dropZoneRef} className="bg-background text-foreground min-h-screen">
          {isDraggingOver && (
            <div className="fixed inset-0 bg-primary/20 backdrop-blur-sm z-[99] flex flex-col items-center justify-center pointer-events-none">
                <UploadCloud className="w-24 h-24 text-primary animate-pulse" />
                <p className="mt-4 text-2xl font-bold text-primary-foreground">Drop file to upload</p>
            </div>
          )}
          <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/20">
            <nav className="flex items-center justify-between h-20 px-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-4">
                <a href="/" className="flex items-center gap-2">
                  {logoSrc && <Image src={logoSrc} alt="NeoX Logo" width={40} height={40} priority />}
                  <span className="font-bold text-xl text-foreground">Neo X</span>
                </a>
              </div>
              <div className="flex items-center gap-2">
                 <Button variant="ghost" size="icon" onClick={() => setIsHistoryOpen(true)}>
                    <History className="h-5 w-5" />
                 </Button>
                 <Button variant="ghost" size="icon" onClick={() => setIsSettingsOpen(true)}>
                    <Settings className="h-5 w-5" />
                 </Button>
              </div>
            </nav>
          </header>
          <main className="flex-1 py-10 lg:py-16">
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                { showUpload && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                    <div className="text-center mb-12 pt-10">
                        <h2 className="text-3xl sm:text-4xl font-bold mb-2">
                            <span className="text-primary">NEO X</span>
                        </h2>
                        <p className="max-w-3xl mx-auto text-muted-foreground mb-8">
                            The most powerful and accurate question prediction AI.
                        </p>
                        
                    </div>
                    <div id="ai-hub-form" className="grid grid-cols-1 gap-6 mb-8 max-w-4xl mx-auto">
                        <FileUploadArea 
                            title="Upload Document"
                            files={documents}
                            onFileChange={handleFileChange}
                            onRemoveFile={handleRemoveFile}
                        />
                    </div>
                    {!user && demoUsed && (
                        <Alert className="max-w-4xl mx-auto my-8 border-primary text-primary-foreground bg-primary/10">
                            <Sparkles className="h-4 w-4 !text-primary" />
                            <AlertTitle>You're a natural!</AlertTitle>
                            <AlertDescription>
                                You've used your free demo. Please sign up to unlock unlimited predictions, quizzes, and chat sessions.
                                <Button asChild variant="link" className="p-0 h-auto ml-2 text-primary-foreground"><a href="/auth">Sign up for free</a></Button>
                            </AlertDescription>
                        </Alert>
                    )}
                    <Card className="max-w-4xl mx-auto shadow-2xl bg-card/80 backdrop-blur-sm">
                        <Tabs defaultValue="predictor" className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="predictor"><BrainCircuit className="w-4 h-4 mr-2"/>Exam Predictor</TabsTrigger>
                                <TabsTrigger value="quiz"><FileQuestion className="w-4 h-4 mr-2"/>Quiz Generator</TabsTrigger>
                            </TabsList>
                            <TabsContent value="predictor">
                                <CardHeader>
                                    <CardTitle>Exam Forecaster</CardTitle>
                                    <CardDescription>Analyze past papers and textbooks to predict the most likely exam topics.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleSubmitPrediction} className="space-y-6">
                                        <div className="space-y-3">
                                            <Label className="text-lg font-semibold">Select Exam Type</Label>
                                            <RadioGroup value={examType} onValueChange={setExamType} className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                                {['Plus 2', 'PSC', 'NEET', 'JEE', 'Custom'].map(type => (
                                                     <div key={type}>
                                                        <RadioGroupItem value={type} id={`r-${type}`} className="peer sr-only" />
                                                        <Label
                                                          htmlFor={`r-${type}`}
                                                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                                                        >
                                                          {type}
                                                        </Label>
                                                    </div>
                                                ))}
                                            </RadioGroup>
                                            {examType === 'Custom' && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    className="pt-4"
                                                >
                                                    <Label htmlFor="custom-exam-type">Custom Exam Name</Label>
                                                    <Input 
                                                        id="custom-exam-type" 
                                                        placeholder="e.g., University Entrance Test" 
                                                        value={customExamType} 
                                                        onChange={(e) => setCustomExamType(e.target.value)}
                                                    />
                                                </motion.div>
                                            )}
                                        </div>
                                        <div>
                                            <Button type="submit" size="lg" className="w-full" disabled={isLoading || (!user && demoUsed)}>
                                                {isLoading ? <><LoaderCircle className="mr-2 h-4 w-4 animate-spin" />Analyzing...</> : 'Predict My Exam'}
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </TabsContent>
                             <TabsContent value="quiz">
                                <CardHeader>
                                    <CardTitle>AI Quiz Generator</CardTitle>
                                    <CardDescription>Test your knowledge by generating a quiz from your uploaded documents.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleGenerateQuiz} className="space-y-6">
                                        <div className="space-y-3">
                                            <Label htmlFor="num-questions" className="text-lg font-semibold">Number of Questions</Label>
                                            <RadioGroup
                                                value={String(numQuestions)}
                                                onValueChange={(val) => setNumQuestions(Number(val))}
                                                className="grid grid-cols-2 md:grid-cols-4 gap-4"
                                            >
                                                {[5, 10, 15, 20].map(num => (
                                                     <div key={num}>
                                                        <RadioGroupItem value={String(num)} id={`q-${num}`} className="peer sr-only" />
                                                        <Label
                                                          htmlFor={`q-${num}`}
                                                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                                                        >
                                                          {num} Questions
                                                        </Label>
                                                    </div>
                                                ))}
                                            </RadioGroup>
                                        </div>
                                        <Button type="submit" size="lg" className="w-full" disabled={isGeneratingQuiz || (!user && demoUsed)}>
                                            {isGeneratingQuiz ? <><LoaderCircle className="mr-2 h-4 w-4 animate-spin" />Generating Quiz...</> : 'Start Quiz'}
                                        </Button>
                                    </form>
                                </CardContent>
                            </TabsContent>
                        </Tabs>
                    </Card>
                    </motion.div>
                )}

                {/* Results */}
                <div ref={resultsRef} className="w-full">
                    {(isLoading || isGeneratingQuiz || prediction || quiz) && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5 }}
                          className="mt-12"
                        >
                            <div className="flex justify-end items-center gap-4 mb-4">
                               <Button variant="outline" onClick={() => setIsChatOpen(true)}><MessageSquare className="mr-2 h-4 w-4"/> Chat with Neo X</Button>
                               <Button onClick={handleNewPrediction}><Plus className="mr-2 h-4 w-4" /> New Prediction</Button>
                            </div>
                            <Card className="shadow-2xl overflow-hidden">
                                <div ref={reportContentRef} className="bg-card p-6">
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <CardTitle className="flex items-center gap-3 text-2xl">
                                            <Sparkles className="text-primary"/>
                                            {(isLoading || isGeneratingQuiz) ? 'Generating...' : (quiz ? "Quiz Results" : `Prediction Results for ${examType === 'Custom' ? customExamType : examType}`)}
                                        </CardTitle>
                                        <CardDescription>{quiz ? "Test your knowledge." : "Here are the topics and recommendations generated by Neo X."}</CardDescription>
                                      </div>
                                       {prediction && user && (
                                            <Button onClick={handleDownloadPdf} disabled={isDownloadingPdf}>
                                                {isDownloadingPdf ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin"/> : <Download className="mr-2 h-4 w-4" />}
                                                Download PDF
                                            </Button>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {/* Loading Skeletons */}
                                    {isLoading && !isGeneratingQuiz && (
                                         <div className="grid md:grid-cols-2 gap-8">
                                            <div className="space-y-4">
                                                 <h3 className="font-bold text-xl flex items-center gap-2"><GraduationCap/> Predicted Topics</h3>
                                                <Skeleton className="h-28 w-full" />
                                                <Skeleton className="h-28 w-full" />
                                                <Skeleton className="h-28 w-full" />
                                            </div>
                                            <div className="space-y-4">
                                                <h3 className="font-bold text-xl flex items-center gap-2"><Lightbulb/> Study Recommendations</h3>
                                                <Skeleton className="h-8 w-full" />
                                                <Skeleton className="h-8 w-full" />
                                                <Skeleton className="h-8 w-full" />
                                                <Skeleton className="h-8 w-full" />
                                            </div>
                                        </div>
                                    )}
                                    {isGeneratingQuiz && (
                                        <div className='space-y-6'>
                                            <Skeleton className="h-8 w-1/2 mx-auto" />
                                            <Skeleton className="h-4 w-1/4 mx-auto" />
                                            <Skeleton className="h-2 w-full" />
                                            <div className='space-y-4 pt-4'>
                                                <Skeleton className="h-10 w-full" />
                                                <Skeleton className="h-10 w-full" />
                                                <Skeleton className="h-10 w-full" />
                                                <Skeleton className="h-10 w-full" />
                                            </div>
                                        </div>
                                    )}

                                    {/* Prediction Results */}
                                    {prediction && !quiz && !isLoading && (
                                        <div className="space-y-8">
                                            <div className="grid md:grid-cols-2 gap-8">
                                                <div className="space-y-4">
                                                    <h3 className="font-bold text-xl flex items-center gap-2"><GraduationCap/> Predicted Key Topics</h3>
                                                    <div className="space-y-4">
                                                        {prediction.predictedTopics.map((item, index) => (
                                                            <Card key={index} className="bg-background">
                                                                <CardHeader className='pb-2'>
                                                                    <CardTitle className="text-lg">{item.topic}</CardTitle>
                                                                    <CardDescription>{item.reason}</CardDescription>
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
                                                        {prediction.studyRecommendations.map((rec, index) => (
                                                            <li key={index} className="flex items-start gap-3">
                                                                <CheckCircle className="h-5 w-5 text-accent mt-1 flex-shrink-0" />
                                                                <span className="text-muted-foreground">{rec}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>

                                            {prediction.predictedQuestions && prediction.predictedQuestions.length > 0 && (
                                                <div className="space-y-4">
                                                    <h3 className="font-bold text-xl flex items-center gap-2"><FileQuestion/> Predicted Questions & Answers</h3>
                                                     <Accordion type="single" collapsible className="w-full space-y-2">
                                                        {prediction.predictedQuestions.map((qa, index) => (
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
                                </CardContent>
                                </div>
                                
                                {quiz && quizScore === null && !isGeneratingQuiz && (
                                    <div className="border-t p-6 space-y-6">
                                        <div className="text-center">
                                            <h3 className="text-xl font-bold">{quiz.title}</h3>
                                            <p className="text-muted-foreground">Question {currentQuestionIndex + 1} of {quiz.questions.length}</p>
                                        </div>
                                        <Progress value={((currentQuestionIndex + 1) / quiz.questions.length) * 100} />

                                        <div className="space-y-4">
                                            <p className="text-lg font-semibold">{quiz.questions[currentQuestionIndex].questionText}</p>
                                            <RadioGroup onValueChange={handleAnswerSelect} value={userAnswers[currentQuestionIndex]} className="space-y-2">
                                                {quiz.questions[currentQuestionIndex].options.map((option, i) => (
                                                    <div key={i} className="flex items-center space-x-2 p-3 bg-muted/50 rounded-md">
                                                        <RadioGroupItem value={option} id={`q${currentQuestionIndex}-opt${i}`} />
                                                        <Label htmlFor={`q${currentQuestionIndex}-opt${i}`} className="w-full cursor-pointer">{option}</Label>
                                                    </div>
                                                ))}
                                            </RadioGroup>
                                        </div>
                                        <div className="flex justify-end">
                                            {currentQuestionIndex < quiz.questions.length - 1 ? (
                                                <Button onClick={handleNextQuestion} disabled={!userAnswers[currentQuestionIndex]}>Next</Button>
                                            ) : (
                                                <Button 
                                                    onClick={handleFinishQuiz} 
                                                    disabled={!quiz || userAnswers.length !== quiz.questions.length || userAnswers.some(a => !a)}
                                                >
                                                    Finish Quiz
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                )}
                                 {quiz && quizScore !== null && (
                                    <div className="border-t p-6 space-y-6">
                                        <div className="text-center space-y-4 flex flex-col items-center">
                                            <h3 className="text-2xl font-bold">Quiz Complete!</h3>
                                            <p className="text-lg">Your Score:</p>
                                            <div className="relative w-32 h-32">
                                                <svg className="w-full h-full" viewBox="0 0 36 36">
                                                    <path
                                                        className="stroke-current text-muted/50"
                                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                        fill="none"
                                                        strokeWidth="3"
                                                    />
                                                    <path
                                                        className="stroke-current text-primary"
                                                        strokeDasharray={`${quizScore}, 100`}
                                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                        fill="none"
                                                        strokeWidth="3"
                                                        strokeLinecap="round"
                                                    />
                                                </svg>
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <span className="text-3xl font-bold">{Math.round(quizScore)}%</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-6 pt-6">
                                            <h4 className="text-xl font-bold flex items-center gap-2"><BookCheck/> Review Your Answers</h4>
                                            {quiz.questions.map((q, index) => {
                                                const userAnswer = userAnswers[index];
                                                const isCorrect = userAnswer === q.correctAnswer;
                                                return (
                                                    <Card key={index} className="bg-background">
                                                        <CardHeader>
                                                            <CardTitle className="text-lg">Question {index + 1}: {q.questionText}</CardTitle>
                                                        </CardHeader>
                                                        <CardContent className="space-y-3">
                                                            <div className="space-y-2">
                                                                {q.options.map((option, i) => {
                                                                    const isUserChoice = userAnswer === option;
                                                                    const isTheCorrectAnswer = q.correctAnswer === option;
                                                                    return (
                                                                        <div 
                                                                            key={i}
                                                                            className={cn(
                                                                                "flex items-center space-x-2 p-3 rounded-md border text-sm",
                                                                                isUserChoice && !isTheCorrectAnswer && "bg-destructive/10 border-destructive/50 text-destructive-foreground",
                                                                                isTheCorrectAnswer && "bg-accent/10 border-accent/50 text-accent-foreground",
                                                                                !isUserChoice && !isTheCorrectAnswer && "bg-muted/50"
                                                                            )}
                                                                        >
                                                                            {isTheCorrectAnswer ? <CheckCircle className="h-4 w-4 text-accent"/> : (isUserChoice ? <X className="h-4 w-4 text-destructive" /> : <div className='w-4 h-4'/>)}
                                                                            <span>{option}</span>
                                                                        </div>
                                                                    )
                                                                })}
                                                            </div>
                                                            <Alert variant={isCorrect ? 'default' : 'destructive'} className={cn(
                                                                isCorrect ? 'bg-accent/10 border-accent/50' : 'bg-destructive/10 border-destructive/50'
                                                            )}>
                                                                <Info className="h-4 w-4" />
                                                                <AlertTitle>{isCorrect ? 'Correct!' : 'Incorrect'}</AlertTitle>
                                                                <AlertDescription>
                                                                    {q.explanation}
                                                                </AlertDescription>
                                                            </Alert>
                                                        </CardContent>
                                                    </Card>
                                                )
                                            })}
                                        </div>
                                        <div className="text-center pt-4">
                                            <Button onClick={handleTryAgain}>Try a New Quiz</Button>
                                        </div>
                                    </div>
                                )}


                                {quizError && (
                                     <div className="p-6 text-center">
                                        <p className="text-destructive">{quizError}</p>
                                        <Button onClick={handleTryAgain} className="mt-4">Try Again</Button>
                                    </div>
                                )}
                            </Card>
                        </motion.div>
                    )}
                </div>
                
                 <SettingsSheet 
                    isOpen={isSettingsOpen}
                    onClose={() => setIsSettingsOpen(false)}
                    onSignOut={handleSignOut}
                />
                
                <HistoryDrawer 
                    isOpen={isHistoryOpen}
                    onClose={() => setIsHistoryOpen(false)}
                />

                <Chat 
                    isOpen={isChatOpen}
                    onClose={() => setIsChatOpen(false)}
                    messages={chatHistory}
                    onSendMessage={handleChatSubmit}
                    isSending={isChatting}
                    title="Chat with Neo X"
                    description={documents.length > 0 ? "Ask me anything about the uploaded documents!" : "Upload some documents to start chatting."}
                    logoUrl={logoSrc}
                />
            </div>
          </main>
        </div>
    );
}


export default function AiHubPage() {
    const { user, isUserLoading } = useUser();
    const router = useRouter();

    useEffect(() => {
        if (!isUserLoading && !user) {
            router.push('/auth');
        }
    }, [user, isUserLoading, router]);

    if (isUserLoading || !user) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <LoaderCircle className="w-10 h-10 animate-spin text-primary" />
            </div>
        );
    }
    
    return (
        <FirebaseClientProvider>
            <AiHubContent />
        </FirebaseClientProvider>
    );
}

    
