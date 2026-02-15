'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useUser } from '@/lib/supabase/provider';
import { getStudentProfile, getPredictions, getQuestionPapers } from '@/lib/supabase/database';
import { signOut } from '@/lib/supabase/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, FileText, TrendingUp, Upload, MessageSquare, Settings, LogOut, Sparkles } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function DashboardPage() {
    const router = useRouter();
    const { user, loading: authLoading } = useUser();
    const [profile, setProfile] = useState<any>(null);
    const [predictions, setPredictions] = useState<any[]>([]);
    const [questionPapers, setQuestionPapers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/auth');
            return;
        }

        if (user) {
            loadDashboardData();
        }
    }, [user, authLoading, router]);

    const loadDashboardData = async () => {
        try {
            const [profileData, predictionsData, papersData] = await Promise.all([
                getStudentProfile(user!.id),
                getPredictions(user!.id),
                getQuestionPapers(user!.id),
            ]);

            setProfile(profileData);
            setPredictions(predictionsData);
            setQuestionPapers(papersData);
        } catch (error) {
            console.error('Error loading dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSignOut = async () => {
        await signOut();
        router.push('/');
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <Image src="/NeoX_Logo_Light.svg" alt="Neo X" width={32} height={32} />
                        <span className="font-bold text-xl">Neo X</span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon">
                            <Settings className="h-5 w-5" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={handleSignOut}>
                            <LogOut className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8 max-w-7xl">
                {/* Welcome Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-3xl font-bold mb-2">
                        Welcome back, {profile?.full_name || 'Student'}!
                    </h1>
                    <p className="text-muted-foreground">
                        Ready to ace your next exam? Let's get started.
                    </p>
                </motion.div>

                {/* Quick Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
                >
                    <Card className="border-2 hover:border-primary transition-colors cursor-pointer" onClick={() => router.push('/ai-hub')}>
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <Sparkles className="h-5 w-5 text-primary" />
                                </div>
                                <CardTitle className="text-lg">New Prediction</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Analyze question papers and predict exam topics
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-2 hover:border-primary transition-colors cursor-pointer" onClick={() => router.push('/upload-qn')}>
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-500/10 rounded-lg">
                                    <Upload className="h-5 w-5 text-blue-500" />
                                </div>
                                <CardTitle className="text-lg">Upload Papers</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Add previous year question papers for analysis
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-2 hover:border-primary transition-colors cursor-pointer">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-500/10 rounded-lg">
                                    <MessageSquare className="h-5 w-5 text-green-500" />
                                </div>
                                <CardTitle className="text-lg">AI Tutor</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Get instant help from your AI study companion
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Stats */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
                >
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Total Predictions
                            </CardTitle>
                            <Brain className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{predictions.length}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Question Papers
                            </CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{questionPapers.length}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Avg. Confidence
                            </CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">
                                {predictions.length > 0
                                    ? Math.round(predictions.reduce((sum, p) => sum + (p.total_confidence_score || 0), 0) / predictions.length)
                                    : 0}%
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Recent Predictions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Predictions</CardTitle>
                            <CardDescription>Your latest AI-generated exam predictions</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {predictions.length === 0 ? (
                                <div className="text-center py-12">
                                    <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                                    <p className="text-muted-foreground mb-4">No predictions yet</p>
                                    <Button onClick={() => router.push('/ai-hub')}>
                                        Create Your First Prediction
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {predictions.slice(0, 5).map((prediction) => (
                                        <div
                                            key={prediction.id}
                                            className="flex items-center justify-between p-4 border border-border rounded-lg hover:border-primary transition-colors cursor-pointer"
                                            onClick={() => router.push(`/predictions/${prediction.id}`)}
                                        >
                                            <div>
                                                <h3 className="font-semibold">{prediction.exam_type} - {prediction.subject}</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    {new Date(prediction.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-2xl font-bold text-primary">
                                                    {Math.round(prediction.total_confidence_score || 0)}%
                                                </div>
                                                <p className="text-xs text-muted-foreground">confidence</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </main>
        </div>
    );
}
