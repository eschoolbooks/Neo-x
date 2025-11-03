'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowRight, BrainCircuit, CheckCircle, Download, FileQuestion, FileUp, GraduationCap, Lightbulb, LoaderCircle, MessageCircle, MessageSquare, Plus, Sparkles, Trash2, X } from 'lucide-react';
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
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Skeleton } from './ui/skeleton';


type AiHubProps = {
    isDemo: boolean;
};

const MAX_FILES = 5;

export function AiHub({ isDemo }: AiHubProps) {
    const [examType, setExamType] = useState('Plus 2');
    const [textbooks, setTextbooks] = useState<File[]>([]);
    const [questionPapers, setQuestionPapers] = useState<File[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();
    const resultsRef = useRef<HTMLDivElement>(null);
    const pdfRef = useRef<HTMLDivElement>(null);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [chatHistory, setChatHistory] = useState<{role: 'user' | 'model', content: string}[]>([]);
    const [isChatting, setIsChatting] = useState(false);
    
    const [textbookDataUris, setTextbookDataUris] = useState<string[]>([]);
    const [questionPaperDataUris, setQuestionPaperDataUris] = useState<string[]>([]);

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

    const fileToDataUri = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, fileType: 'textbooks' | 'questionPapers') => {
        const currentFiles = fileType === 'textbooks' ? textbooks : questionPapers;
        const newFiles = Array.from(e.target.files || []).slice(0, MAX_FILES - currentFiles.length);

        if(currentFiles.length + newFiles.length > MAX_FILES) {
            toast({
                title: 'File Limit Exceeded',
                description: `You can only upload a maximum of ${MAX_FILES} files per category.`,
                variant: 'destructive',
            });
        }

        try {
            const uris = await Promise.all(newFiles.map(fileToDataUri));
            if (fileType === 'textbooks') {
                setTextbooks(prev => [...prev, ...newFiles]);
                setTextbookDataUris(prev => [...prev, ...uris]);
            } else {
                setQuestionPapers(prev => [...prev, ...newFiles]);
                setQuestionPaperDataUris(prev => [...prev, ...uris]);
            }
        } catch (error) {
            toast({
                title: 'File Upload Error',
                description: 'Failed to process files. Please try again.',
                variant: 'destructive',
            });
        }
    };

    const handleRemoveFile = (index: number, fileType: 'textbooks' | 'questionPapers') => {
        if (fileType === 'textbooks') {
            setTextbooks(prev => prev.filter((_, i) => i !== index));
            setTextbookDataUris(prev => prev.filter((_, i) => i !== index));
        } else {
            setQuestionPapers(prev => prev.filter((_, i) => i !== index));
            setQuestionPaperDataUris(prev => prev.filter((_, i) => i !== index));
        }
    };
    
    const handleNewPrediction = () => {
        setShowUpload(true);
        setPrediction(null);
        setQuiz(null);
        setTextbooks([]);
        setQuestionPapers([]);
        setTextbookDataUris([]);
        setQuestionPaperDataUris([]);
        setQuizScore(null);
        setUserAnswers([]);
        setCurrentQuestionIndex(0);
        setError(null);
    };


    const handleSubmitPrediction = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isDemo && demoUsed) {
            toast({ title: 'Demo Limit Reached', description: 'Please sign up to continue predicting exams.', variant: 'destructive' });
            return;
        }
        if (textbooks.length === 0 && questionPapers.length === 0) {
            toast({
                title: 'No files uploaded',
                description: 'Please upload at least one textbook or question paper.',
                variant: 'destructive',
            });
            return;
        }

        setIsLoading(true);
        setError(null);
        setPrediction(null);
        setQuiz(null);
        setShowUpload(false);


        try {
            const result = await predictExam({
                examType,
                textbookPdfs: textbookDataUris,
                questionPapers: questionPaperDataUris,
            });
            
            setPrediction(result);
            if (isDemo) setDemoUsed(true);

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
         if (isDemo && demoUsed && quiz) { // Allow one demo quiz
            toast({ title: 'Demo Limit Reached', description: 'Please sign up to continue generating quizzes.', variant: 'destructive' });
            return;
        }
        if (textbooks.length === 0 && questionPapers.length === 0) {
            toast({
                title: 'No files uploaded',
                description: 'Please upload at least one textbook or question paper.',
                variant: 'destructive',
            });
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
                textbookPdfs: textbookDataUris,
                questionPapers: questionPaperDataUris,
            });

            if (result.questions.length === 0) {
                setQuizError("The AI couldn't generate a quiz from the provided documents. Try different files.");
                toast({
                    title: 'Quiz Generation Failed',
                    description: "The AI couldn't generate a quiz. Please try different documents.",
                    variant: 'destructive',
                });
                setShowUpload(true);
            } else {
                setQuiz(result);
                if (isDemo) setDemoUsed(true);
                 setTimeout(() => {
                    resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
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
        if (isDemo) setDemoUsed(false);
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
          textbookPdfs: textbookDataUris,
          questionPapers: questionPaperDataUris
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

    const generateUniqueId = () => {
        const date = new Date();
        const year = date.getFullYear();
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const alphanumeric = Math.random().toString(36).substring(2, 8).toUpperCase();
        return `${year}N${day}E${month}O${alphanumeric}X`;
    };

    const handleDownloadPdf = async () => {
        if (!pdfRef.current || !prediction) return;
        setIsDownloadingPdf(true);
        try {
            const canvas = await html2canvas(pdfRef.current, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#0a0e1c',
            });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            
            const uniqueId = generateUniqueId();
            const predictionDate = new Date().toLocaleDateString();

            // Header
            const logo = "https://media.licdn.com/dms/image/v2/D4E0BAQETuF_JEMo6MQ/company-logo_200_200/company-logo_200_200/0/1685716892227?e=2147483647&v=beta&t=vAW_vkOt-KSxA9tSNdgNszeTgz9l_UX0nkz0S_jDSz8";
            pdf.addImage(logo, 'PNG', 15, 10, 20, 20);
            pdf.setFontSize(20);
            pdf.setTextColor('#f9b17a');
            pdf.text('E-SchoolBooks', 40, 22);
             pdf.setFontSize(10);
            pdf.setTextColor('#a0a0a0');
            pdf.text(`Prediction Report - ${predictionDate}`, 40, 28);
            
            // Body
            pdf.addImage(imgData, 'PNG', 0, 40, pdfWidth, pdfHeight);

            // Footer
            pdf.setFontSize(8);
            pdf.setTextColor('#606060');
            pdf.text(`Report ID: ${uniqueId}`, 15, pdf.internal.pageSize.getHeight() - 10);
            pdf.text(`© ${new Date().getFullYear()} E-SchoolBooks. All Rights Reserved.`, pdf.internal.pageSize.getWidth() / 2, pdf.internal.pageSize.getHeight() - 10, { align: 'center' });


            pdf.save(`E-SchoolBooks-Prediction-${examType}-${new Date().toISOString().split('T')[0]}.pdf`);

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
    
    const FileUploadArea = ({title, fileType, files, onFileChange, onRemoveFile} : {title: string, fileType: 'textbooks'|'questionPapers', files: File[], onFileChange: any, onRemoveFile: any}) => {
        const fileCount = files.length;
        const isLimitReached = fileCount >= MAX_FILES;

        return (
            <div className="space-y-2">
                <Label htmlFor={fileType} className="text-lg font-semibold flex justify-between">
                    {title} (PDF) <span>{fileCount} / {MAX_FILES}</span>
                </Label>
                 {isLimitReached && (
                    <Alert variant="destructive" className="text-xs">
                        <AlertDescription>
                            You have reached the maximum number of files.
                        </AlertDescription>
                    </Alert>
                )}
                <div className="flex items-center justify-center w-full">
                    <label htmlFor={`${fileType}-input`} className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg ${isLimitReached ? 'bg-muted/50 cursor-not-allowed' : 'cursor-pointer bg-card/50 hover:bg-muted'}`}>
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <FileUp className="w-8 h-8 mb-2 text-muted-foreground" />
                            <p className="mb-1 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                        </div>
                        <input id={`${fileType}-input`} type="file" className="hidden" multiple accept=".pdf" onChange={onFileChange} disabled={isLimitReached} />
                    </label>
                </div>
                <div className="space-y-1 pt-2">
                    {files.map((file, index) => (
                        <div key={index} className="flex items-center justify-between text-sm p-2 bg-muted rounded-md">
                            <span className="truncate pr-2">{file.name}</span>
                            <Button type="button" variant="ghost" size="icon" className="h-6 w-6 flex-shrink-0" onClick={() => onRemoveFile(index, fileType)}><X className="h-4 w-4" /></Button>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
    
    return (
         <>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                { showUpload && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                    <div className="text-center mb-12">
                        <h2 className="text-3xl sm:text-4xl font-bold mb-2">
                            <span className="text-primary">NEO X</span>
                        </h2>
                        <p className="max-w-3xl mx-auto text-muted-foreground mb-8">
                            The most powerful and accurate question prediction AI.
                        </p>
                         {isDemo && (
                            <div className="flex justify-center gap-4">
                                <Button size="lg" asChild className="rounded-full text-lg px-8 py-6" variant="secondary">
                                <a href="#">Learn More</a>
                                </Button>
                                <Button size="lg" asChild className="rounded-full text-lg px-8 py-6" variant="default">
                                    <a href="/ai-hub">
                                        Predict Questions <ArrowRight className="ml-2 h-5 w-5" />
                                    </a>
                                </Button>
                            </div>
                         )}
                    </div>
                    <div id="ai-hub-form" className="grid md:grid-cols-2 gap-6 mb-8">
                        <FileUploadArea 
                            title="Textbooks"
                            fileType="textbooks"
                            files={textbooks}
                            onFileChange={(e) => handleFileChange(e, 'textbooks')}
                            onRemoveFile={handleRemoveFile}
                        />
                         <FileUploadArea 
                            title="Question Papers"
                            fileType="questionPapers"
                            files={questionPapers}
                            onFileChange={(e) => handleFileChange(e, 'questionPapers')}
                            onRemoveFile={handleRemoveFile}
                        />
                    </div>
                    {isDemo && demoUsed && (
                        <Alert className="max-w-4xl mx-auto my-8 border-primary text-primary-foreground bg-primary/10">
                            <Sparkles className="h-4 w-4 !text-primary" />
                            <AlertTitle>You're a natural!</AlertTitle>
                            <AlertDescription>
                                You've used your free demo. Please sign up to unlock unlimited predictions, quizzes, and chat sessions.
                                <Button asChild variant="link" className="p-0 h-auto ml-2 text-primary-foreground"><a href="#">Sign up for free</a></Button>
                            </AlertDescription>
                        </Alert>
                    )}
                    <Card className="max-w-4xl mx-auto shadow-2xl bg-card/80 backdrop-blur-sm">
                        <Tabs defaultValue="predictor" className="w-full">
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="predictor"><BrainCircuit className="w-4 h-4 mr-2"/>Exam Predictor</TabsTrigger>
                                <TabsTrigger value="quiz"><FileQuestion className="w-4 h-4 mr-2"/>Quiz Generator</TabsTrigger>
                                <TabsTrigger value="chat"><MessageSquare className="w-4 h-4 mr-2"/>Chat Tutor</TabsTrigger>
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
                                            <RadioGroup value={examType} onValueChange={setExamType} className="flex flex-wrap gap-4">
                                                {['Plus 2', 'PSC', 'NEET', 'JEE', 'Custom'].map(type => (
                                                    <div key={type} className="flex items-center space-x-2">
                                                        <RadioGroupItem value={type} id={`r-${type}`} />
                                                        <Label htmlFor={`r-${type}`}>{type}</Label>
                                                    </div>
                                                ))}
                                            </RadioGroup>
                                        </div>
                                        <div>
                                            <Button type="submit" size="lg" className="w-full" disabled={isLoading || (isDemo && demoUsed)}>
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
                                                className="flex flex-wrap gap-4"
                                            >
                                                {[5, 10, 15, 20].map(num => (
                                                    <div key={num} className="flex items-center space-x-2">
                                                        <RadioGroupItem value={String(num)} id={`q-${num}`} />
                                                        <Label htmlFor={`q-${num}`}>{num}</Label>
                                                    </div>
                                                ))}
                                            </RadioGroup>
                                        </div>
                                        <Button type="submit" size="lg" className="w-full" disabled={isGeneratingQuiz || (isDemo && demoUsed && !!quiz)}>
                                            {isGeneratingQuiz ? <><LoaderCircle className="mr-2 h-4 w-4 animate-spin" />Generating Quiz...</> : 'Start Quiz'}
                                        </Button>
                                    </form>
                                </CardContent>
                            </TabsContent>
                            <TabsContent value="chat">
                                <CardHeader>
                                    <CardTitle>Chat with Neo X</CardTitle>
                                    <CardDescription>Ask questions, clarify doubts, and get instant help with your studies.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-center text-muted-foreground">
                                        Use the chat bubble at the bottom-right corner to talk with Neo X anytime!
                                    </p>
                                    <div className="flex justify-center mt-4">
                                        <Button onClick={() => setIsChatOpen(true)}>Open Chat</Button>
                                    </div>
                                </CardContent>
                            </TabsContent>
                        </Tabs>
                    </Card>
                    </motion.div>
                )}

                {/* Results */}
                <div ref={resultsRef}>
                    {(prediction || quiz) && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5 }}
                          className="mt-12"
                        >
                            {!isDemo && (
                                <div className="flex justify-end mb-4">
                                <Button onClick={handleNewPrediction}><Plus className="mr-2 h-4 w-4" /> New Prediction</Button>
                                </div>
                            )}
                            <Card className="shadow-2xl overflow-hidden">
                                <div ref={pdfRef} className="bg-card">
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <CardTitle className="flex items-center gap-3 text-2xl">
                                            <Sparkles className="text-primary"/>
                                            {quiz ? "Quiz Results" : `Prediction Results for ${examType}`}
                                        </CardTitle>
                                        <CardDescription>{quiz ? "Test your knowledge." : "Here are the topics and recommendations generated by Neo X."}</CardDescription>
                                      </div>
                                       {!isDemo && prediction && (
                                            <Button onClick={handleDownloadPdf} disabled={isDownloadingPdf}>
                                                {isDownloadingPdf ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin"/> : <Download className="mr-2 h-4 w-4" />}
                                                Download PDF
                                            </Button>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent className="grid md:grid-cols-2 gap-8">
                                    {/* Predicted Topics */}
                                    {prediction && !quiz && (
                                    <>
                                        <div className="space-y-4">
                                            <h3 className="font-bold text-xl flex items-center gap-2"><GraduationCap/> Predicted Topics</h3>
                                            <div className="space-y-4">
                                                {prediction.predictedTopics.map((item, index) => (
                                                    <Card key={index} className="bg-background">
                                                        <CardHeader className='pb-2'>
                                                            <CardTitle className="text-lg">{item.topic}</CardTitle>
                                                        </CardHeader>
                                                        <CardContent>
                                                            <p className="text-sm text-muted-foreground mb-3">{item.reason}</p>
                                                            <div className='flex items-center gap-2'>
                                                                <Progress value={item.confidence || 0} className="h-2" />
                                                                <span className="font-semibold text-sm text-right min-w-[40px]">{item.confidence || 0}%</span>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                ))}
                                            </div>
                                        </div>
                                        {/* Study Recommendations */}
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
                                    </>
                                    )}
                                    {(isLoading || isGeneratingQuiz) && (
                                        <>
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
                                        </>
                                    )}
                                </CardContent>
                                </div>
                                
                                {quiz && quizScore === null && (
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

                                {quizScore !== null && (
                                    <div className="border-t p-6 text-center space-y-6 flex flex-col items-center">
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
                                        <Button onClick={handleTryAgain}>Try a New Quiz</Button>
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
            </div>
             {/* Chat FAB */}
            <div className="fixed bottom-6 right-6 z-50">
                <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 1 }}
                >
                    <Button size="lg" className="rounded-full w-16 h-16 shadow-lg" onClick={() => setIsChatOpen(true)}>
                    <MessageCircle className="h-8 w-8" />
                    </Button>
                </motion.div>
            </div>

            {/* Chat Window */}
            <Chat 
                isOpen={isChatOpen}
                onClose={() => setIsChatOpen(false)}
                messages={chatHistory}
                onSendMessage={handleChatSubmit}
                isSending={isChatting}
                title="Chat with Neo X"
                description={textbooks.length > 0 || questionPapers.length > 0 ? "Ask me anything about the uploaded documents!" : "Upload some documents to start chatting."}
                logoUrl="https://media.licdn.com/dms/image/v2/D4E0BAQETuF_JEMo6MQ/company-logo_200_200/company-logo_200_200/0/1685716892227?e=2147483647&v=beta&t=vAW_vkOt-KSxA9tSNdgNszeTgz9l_UX0nkz0S_jDSz8"
            />
        </>
    );
}
