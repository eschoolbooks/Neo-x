'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useUser } from '@/lib/supabase/provider';
import { getQuestionPapers, createPrediction } from '@/lib/supabase/database';
import { predictExamQuestions } from '@/ai/question-predictor';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Brain, FileText, Loader2, Sparkles, ArrowRight, Upload, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const EXAM_TYPES = ['NEET', 'JEE Main', 'JEE Advanced', 'Plus 2', 'CBSE 12th', 'State Board', 'UPSC'];
const SUBJECTS = ['Physics', 'Chemistry', 'Mathematics', 'Biology'];

export default function AIHubPage() {
    const router = useRouter();
    const { user, loading: authLoading } = useUser();
    const { toast } = useToast();
    const [questionPapers, setQuestionPapers] = useState<any[]>([]);
    const [selectedPapers, setSelectedPapers] = useState<string[]>([]);
    const [examType, setExamType] = useState('');
    const [subject, setSubject] = useState('');
    const [generating, setGenerating] = useState(false);
    const [step, setStep] = useState<'select' | 'configure' | 'generating'>('select');

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/auth');
            return;
        }

        if (user) {
            loadQuestionPapers();
        }
    }, [user, authLoading, router]);

    const loadQuestionPapers = async () => {
        const papers = await getQuestionPapers(user!.id);
        setQuestionPapers(papers);
    };

    const togglePaper = (paperId: string) => {
        setSelectedPapers(prev =>
            prev.includes(paperId)
                ? prev.filter(id => id !== paperId)
                : [...prev, paperId]
        );
    };

    const handleConfigure = () => {
        if (selectedPapers.length === 0) {
            toast({
                title: "No papers selected",
                description: "Please select at least one question paper",
                variant: "destructive",
            });
            return;
        }
        setStep('configure');
    };

    const handleGenerate = async () => {
        if (!examType || !subject) {
            toast({
                title: "Missing information",
                description: "Please select exam type and subject",
                variant: "destructive",
            });
            return;
        }

        setGenerating(true);
        setStep('generating');

        try {
            // Get selected papers data
            const selectedPapersData = questionPapers.filter(p => selectedPapers.includes(p.id));

            // Generate prediction using AI
            const result = await predictExamQuestions(
                examType,
                subject,
                selectedPapersData
            );

            // Save prediction to database
            const prediction = await createPrediction({
                user_id: user!.id,
                exam_type: examType,
                subject: subject,
                question_paper_ids: selectedPapers,
                predicted_topics: result.predictedTopics as any,
                predicted_questions: result.predictedQuestions as any,
                study_recommendations: result.studyRecommendations as any,
                total_confidence_score: result.totalConfidenceScore,
                processing_time_seconds: result.processingTimeSeconds,
            });

            toast({
                title: "Prediction generated!",
                description: "Your exam prediction is ready",
            });

            router.push(`/predictions/${prediction.id}`);
        } catch (error) {
            toast({
                title: "Generation failed",
                description: error instanceof Error ? error.message : "Failed to generate prediction",
                variant: "destructive",
            });
            setStep('configure');
        } finally {
            setGenerating(false);
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <Link href="/dashboard" className="flex items-center gap-2">
                        <Image src="/NeoX_Logo_Light.svg" alt="Neo X" width={32} height={32} />
                        <span className="font-bold text-xl">Neo X</span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <Link href="/upload-qn">
                            <Button variant="outline">
                                <Upload className="mr-2 h-4 w-4" />
                                Upload Papers
                            </Button>
                        </Link>
                        <Link href="/dashboard">
                            <Button variant="ghost">Dashboard</Button>
                        </Link>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-12 max-w-5xl">
                {/* Hero */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
                        <Sparkles className="h-4 w-4" />
                        <span className="text-sm font-medium">AI-Powered Prediction</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        Predict Your Exam Questions
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Upload previous year question papers and let our AI analyze patterns to predict likely topics and questions for your upcoming exam
                    </p>
                </motion.div>

                {/* Main Content */}
                {step === 'select' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5" />
                                    Select Question Papers
                                </CardTitle>
                                <CardDescription>
                                    Choose the previous year question papers for AI analysis
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {questionPapers.length === 0 ? (
                                    <div className="text-center py-12">
                                        <Upload className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-20" />
                                        <p className="text-muted-foreground mb-4">No question papers uploaded yet</p>
                                        <Button asChild>
                                            <Link href="/upload-qn">
                                                <Upload className="mr-2 h-4 w-4" />
                                                Upload Question Papers
                                            </Link>
                                        </Button>
                                    </div>
                                ) : (
                                    <>
                                        <div className="space-y-3 mb-6">
                                            {questionPapers.map(paper => (
                                                <div
                                                    key={paper.id}
                                                    className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-colors ${selectedPapers.includes(paper.id)
                                                            ? 'border-primary bg-primary/5'
                                                            : 'border-border hover:border-primary/50'
                                                        }`}
                                                    onClick={() => togglePaper(paper.id)}
                                                >
                                                    <Checkbox
                                                        checked={selectedPapers.includes(paper.id)}
                                                        onCheckedChange={() => togglePaper(paper.id)}
                                                    />
                                                    <div className="flex-1">
                                                        <p className="font-medium">{paper.title}</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {paper.exam_type} • {paper.subject} • {paper.year}
                                                        </p>
                                                    </div>
                                                    {selectedPapers.includes(paper.id) && (
                                                        <CheckCircle2 className="h-5 w-5 text-primary" />
                                                    )}
                                                </div>
                                            ))}
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <p className="text-sm text-muted-foreground">
                                                {selectedPapers.length} paper{selectedPapers.length !== 1 ? 's' : ''} selected
                                            </p>
                                            <Button
                                                onClick={handleConfigure}
                                                disabled={selectedPapers.length === 0}
                                            >
                                                Continue
                                                <ArrowRight className="ml-2 h-4 w-4" />
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {step === 'configure' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Brain className="h-5 w-5" />
                                    Configure Prediction
                                </CardTitle>
                                <CardDescription>
                                    Specify your exam details for accurate predictions
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Exam Type</Label>
                                        <Select value={examType} onValueChange={setExamType}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select exam type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {EXAM_TYPES.map(type => (
                                                    <SelectItem key={type} value={type}>{type}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Subject</Label>
                                        <Select value={subject} onValueChange={setSubject}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select subject" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {SUBJECTS.map(sub => (
                                                    <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <Button variant="outline" onClick={() => setStep('select')} className="flex-1">
                                        Back
                                    </Button>
                                    <Button onClick={handleGenerate} className="flex-1" disabled={!examType || !subject}>
                                        <Sparkles className="mr-2 h-4 w-4" />
                                        Generate Prediction
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {step === 'generating' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <Card>
                            <CardContent className="py-16">
                                <div className="text-center">
                                    <div className="mb-6">
                                        <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto" />
                                    </div>
                                    <h2 className="text-2xl font-bold mb-2">Analyzing Question Papers</h2>
                                    <p className="text-muted-foreground mb-6">
                                        Our AI is identifying patterns and predicting likely exam topics...
                                    </p>
                                    <div className="max-w-md mx-auto">
                                        <div className="space-y-2 text-sm text-left">
                                            <div className="flex items-center gap-2">
                                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                                <span>Processing {selectedPapers.length} question papers</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                                <span>Identifying topic patterns...</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </main>
        </div>
    );
}
