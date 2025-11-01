'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowRight, BrainCircuit, CheckCircle, FileQuestion, FileUp, GraduationCap, Lightbulb, LoaderCircle, MessageCircle, MessageSquare, Sparkles, X } from 'lucide-react';
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

type AiHubProps = {
    isDemo: boolean;
};

export function AiHub({ isDemo }: AiHubProps) {
    const [examType, setExamType] = useState('Plus 2');
    const [textbooks, setTextbooks] = useState<File[]>([]);
    const [questionPapers, setQuestionPapers] = useState<File[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [prediction, setPrediction] = useState<PredictExamOutput | null>(null);
    const { toast } = useToast();
    const resultsRef = useRef<HTMLDivElement>(null);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [chatHistory, setChatHistory] = useState<{role: 'user' | 'model', content: string}[]>([]);
    const [isChatting, setIsChatting] = useState(false);
    
    // Persist data URIs
    const [textbookDataUris, setTextbookDataUris] = useState<string[]>([]);
    const [questionPaperDataUris, setQuestionPaperDataUris] = useState<string[]>([]);

    // Quiz State
    const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [quizError, setQuizError] = useState<string | null>(null);
    const [numQuestions, setNumQuestions] = useState(5);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState<string[]>([]);
    const [quizScore, setQuizScore] = useState<number | null>(null);

    // Demo state
    const [demoUsed, setDemoUsed] = useState(false);

    const fileToDataUri = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, fileType: 'textbooks' | 'questionPapers') => {
        const newFiles = Array.from(e.target.files || []);
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
         if (isDemo && demoUsed) {
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
            } else {
                 setQuiz(result);
                 if (isDemo) setDemoUsed(true);
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setQuizError(errorMessage);
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


    return (
        <>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl sm:text-4xl font-bold mb-2">
                        Welcome to the <span className="text-primary">AI-Powered Study Hub</span>
                    </h2>
                    <p className="max-w-3xl mx-auto text-muted-foreground mb-8">
                        Meet Neo X, your personal Educational Mentor Assistant. Upload your textbooks and past question papers, then let Neo X help you predict exams, generate quizzes, and answer your toughest questions.
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
                    <div className="space-y-2">
                        <Label htmlFor="textbooks" className="text-lg font-semibold">Textbooks (PDF)</Label>
                        <div className="flex items-center justify-center w-full">
                            <label htmlFor="textbooks-input" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-card/50 hover:bg-muted">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <FileUp className="w-8 h-8 mb-2 text-muted-foreground" />
                                    <p className="mb-1 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                </div>
                                <input id="textbooks-input" type="file" className="hidden" multiple accept=".pdf" onChange={(e) => handleFileChange(e, 'textbooks')} />
                            </label>
                        </div>
                        <div className="space-y-1 pt-2">
                            {textbooks.map((file, index) => (
                                <div key={index} className="flex items-center justify-between text-sm p-2 bg-muted rounded-md">
                                    <span className="truncate pr-2">{file.name}</span>
                                    <Button type="button" variant="ghost" size="icon" className="h-6 w-6 flex-shrink-0" onClick={() => handleRemoveFile(index, 'textbooks')}><X className="h-4 w-4" /></Button>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="question-papers" className="text-lg font-semibold">Question Papers (PDF)</Label>
                        <div className="flex items-center justify-center w-full">
                            <label htmlFor="question-papers-input" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-card/50 hover:bg-muted">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <FileUp className="w-8 h-8 mb-2 text-muted-foreground" />
                                    <p className="mb-1 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                </div>
                                <input id="question-papers-input" type="file" className="hidden" multiple accept=".pdf" onChange={(e) => handleFileChange(e, 'questionPapers')} />
                            </label>
                        </div>
                         <div className="space-y-1 pt-2">
                            {questionPapers.map((file, index) => (
                                <div key={index} className="flex items-center justify-between text-sm p-2 bg-muted rounded-md">
                                    <span className="truncate pr-2">{file.name}</span>
                                    <Button type="button" variant="ghost" size="icon" className="h-6 w-6 flex-shrink-0" onClick={() => handleRemoveFile(index, 'questionPapers')}><X className="h-4 w-4" /></Button>
                                </div>
                            ))}
                        </div>
                    </div>
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
                    
                    {/* Exam Predictor Tab */}
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
                    
                    {/* Quiz Generator Tab */}
                    <TabsContent value="quiz">
                         <CardHeader>
                            <CardTitle>AI Quiz Generator</CardTitle>
                            <CardDescription>Test your knowledge by generating a quiz from your uploaded documents.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {!quiz && quizScore === null && (
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
                                    <Button type="submit" size="lg" className="w-full" disabled={isGeneratingQuiz || (isDemo && demoUsed)}>
                                        {isGeneratingQuiz ? <><LoaderCircle className="mr-2 h-4 w-4 animate-spin" />Generating Quiz...</> : 'Start Quiz'}
                                    </Button>
                                </form>
                            )}

                             {quiz && quizScore === null && (
                                <div className="space-y-6">
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
                                <div className="text-center space-y-6 flex flex-col items-center">
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

                             {quizError && <p className="text-destructive text-center">{quizError}</p>}
                        </CardContent>
                    </TabsContent>

                    {/* Chat Tutor Tab */}
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

                {/* Prediction Results */}
                <div ref={resultsRef}>
                    {prediction && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5 }}
                          className="mt-12"
                        >
                            <Card className="shadow-2xl">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-3 text-2xl">
                                        <Sparkles className="text-primary"/>
                                        Prediction Results for {examType}
                                    </CardTitle>
                                    <CardDescription>Here are the topics and recommendations generated by Neo X.</CardDescription>
                                </CardHeader>
                                <CardContent className="grid md:grid-cols-2 gap-8">
                                    {/* Predicted Topics */}
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
                                </CardContent>
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
