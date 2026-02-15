'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useUser } from '@/lib/supabase/provider';
import { getPrediction } from '@/lib/supabase/database';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Download, Brain, BookOpen, Lightbulb, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function PredictionPage() {
    const params = useParams();
    const router = useRouter();
    const { user, loading: authLoading } = useUser();
    const [prediction, setPrediction] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/auth');
            return;
        }

        if (user && params.id) {
            loadPrediction();
        }
    }, [user, authLoading, params.id, router]);

    const loadPrediction = async () => {
        try {
            const data = await getPrediction(params.id as string);
            setPrediction(data);
        } catch (error) {
            console.error('Error loading prediction:', error);
        } finally {
            setLoading(false);
        }
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading prediction...</p>
                </div>
            </div>
        );
    }

    if (!prediction) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-muted-foreground mb-4">Prediction not found</p>
                    <Button asChild>
                        <Link href="/dashboard">Back to Dashboard</Link>
                    </Button>
                </div>
            </div>
        );
    }

    const topics = (prediction.predicted_topics || []) as any[];
    const questions = (prediction.predicted_questions || []) as any[];
    const recommendations = (prediction.study_recommendations || []) as any[];

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'text-red-500 bg-red-500/10';
            case 'medium': return 'text-yellow-500 bg-yellow-500/10';
            case 'low': return 'text-green-500 bg-green-500/10';
            default: return 'text-gray-500 bg-gray-500/10';
        }
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <Button variant="ghost" asChild>
                            <Link href="/dashboard">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Dashboard
                            </Link>
                        </Button>
                        <Button variant="outline">
                            <Download className="mr-2 h-4 w-4" />
                            Export PDF
                        </Button>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8 max-w-5xl">
                {/* Prediction Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">
                                {prediction.exam_type} - {prediction.subject}
                            </h1>
                            <p className="text-muted-foreground">
                                Generated on {new Date(prediction.created_at).toLocaleDateString()}
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="text-4xl font-bold text-primary mb-1">
                                {Math.round(prediction.total_confidence_score || 0)}%
                            </div>
                            <p className="text-sm text-muted-foreground">Overall Confidence</p>
                        </div>
                    </div>
                    {prediction.processing_time_seconds && (
                        <p className="text-xs text-muted-foreground">
                            Analysis completed in {prediction.processing_time_seconds}s
                        </p>
                    )}
                </motion.div>

                {/* Predicted Topics */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mb-8"
                >
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Brain className="h-5 w-5 text-primary" />
                                <CardTitle>Predicted Topics</CardTitle>
                            </div>
                            <CardDescription>
                                Topics likely to appear based on previous year patterns
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {topics.map((topic, index) => (
                                    <div key={index} className="border border-border rounded-lg p-4">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-semibold">{topic.topic}</h3>
                                                    <Badge variant="outline" className={getPriorityColor(topic.priority)}>
                                                        {topic.priority || 'medium'}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-muted-foreground">{topic.subject}</p>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-2xl font-bold text-primary">
                                                    {topic.confidence}%
                                                </div>
                                            </div>
                                        </div>
                                        <Progress value={topic.confidence} className="mb-3 h-2" />
                                        <p className="text-sm text-muted-foreground mb-2">
                                            {topic.justification}
                                        </p>
                                        {topic.estimatedHours && (
                                            <p className="text-xs text-muted-foreground">
                                                Estimated study time: {topic.estimatedHours} hours
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Predicted Questions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mb-8"
                >
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <BookOpen className="h-5 w-5 text-primary" />
                                <CardTitle>Predicted Questions</CardTitle>
                            </div>
                            <CardDescription>
                                Likely exam questions with detailed answers
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {questions.map((q, index) => (
                                    <div key={index}>
                                        <div className="mb-4">
                                            <div className="flex items-start justify-between mb-2">
                                                <h3 className="font-semibold text-lg flex-1">
                                                    Q{index + 1}. {q.question}
                                                </h3>
                                                <Badge variant="outline">{q.difficulty || 'medium'}</Badge>
                                            </div>
                                            <p className="text-xs text-muted-foreground mb-3">
                                                Topic: {q.topic} • Confidence: {q.confidence}% • Type: {q.type}
                                            </p>
                                            <div className="bg-muted/50 rounded-lg p-4">
                                                <p className="text-sm font-semibold mb-2">Answer:</p>
                                                <p className="text-sm leading-relaxed">{q.answer}</p>
                                            </div>
                                        </div>
                                        {index < questions.length - 1 && <Separator />}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Study Recommendations */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Lightbulb className="h-5 w-5 text-primary" />
                                <CardTitle>Study Recommendations</CardTitle>
                            </div>
                            <CardDescription>
                                Strategic study tips to maximize your preparation
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {recommendations.map((rec, index) => (
                                    <div key={index} className="flex items-start gap-3">
                                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                                            {rec.priority || index + 1}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold mb-1">{rec.title}</h3>
                                            <p className="text-sm text-muted-foreground">{rec.description}</p>
                                            {rec.estimatedHours && (
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    Time needed: ~{rec.estimatedHours} hours
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </main>
        </div>
    );
}
