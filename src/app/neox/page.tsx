
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, BrainCircuit, FileQuestion, MessageSquare, UploadCloud, FileText, CheckCircle } from 'lucide-react';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const FeatureCard = ({ icon, title, description, delay = 0 }: { icon: React.ReactNode, title: string, description: string, delay?: number }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.5, delay }}
        className="bg-card/50 p-6 rounded-lg border border-border/20 backdrop-blur-sm"
    >
        <div className="text-primary mb-4">{icon}</div>
        <h3 className="text-xl font-bold text-foreground mb-2">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
    </motion.div>
);

export default function NeoXPage() {
  const { resolvedTheme } = useTheme();
  const [logoSrc, setLogoSrc] = useState('/NeoX_Logo_Light.svg');

  useEffect(() => {
    setLogoSrc(resolvedTheme === 'dark' ? '/NeoX_Logo_Dark.svg' : '/NeoX_Logo_Light.svg');
  }, [resolvedTheme]);

  return (
    <div className="bg-background text-foreground overflow-x-hidden">
        <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/20">
            <nav className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-20">
            <a href="/neox" className="flex items-center gap-2">
                {logoSrc && <Image src={logoSrc} alt="NeoX Logo" width={40} height={40} priority />}
                <span className="font-bold text-xl text-foreground">Neo X</span>
            </a>
            <div className="hidden md:flex items-center gap-8">
                <a href="/" className="hover:text-primary transition-colors">E-SchoolBooks</a>
                <a href="/ai-hub" className="hover:text-primary transition-colors">AI Hub</a>
                <a href="/donate" className="hover:text-primary transition-colors">Donate</a>
            </div>
            <div className="flex items-center gap-4">
                <Button asChild className="rounded-full bg-primary hover:bg-primary/90">
                    <a href="/auth">Get Started <ArrowRight className="ml-2 h-4 w-4" /></a>
                </Button>
            </div>
            </nav>
        </header>

        <main>
            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/20 to-background opacity-50"></div>
                <div className="absolute inset-0 bg-grid-slow"></div>
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,hsl(var(--primary)_/_0.3),rgba(255,255,255,0))]"></div>

                <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                    >
                        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tighter text-foreground mb-6">
                            The Future of Studying is Here.<br />Meet <span className="text-primary">Neo X</span>.
                        </h1>
                        <p className="max-w-3xl mx-auto text-lg md:text-xl text-muted-foreground mb-10">
                           Your personal AI assistant designed to revolutionize how you prepare for exams. Analyze materials, predict key topics, generate quizzes, and get instant answers from an AI tutor.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <Button size="lg" asChild className="rounded-full text-lg px-10 py-6 bg-primary hover:bg-primary/90 text-primary-foreground" variant="default">
                                <a href="/ai-hub">
                                    Launch AI Hub <ArrowRight className="ml-2 h-5 w-5" />
                                </a>
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </section>
            
            {/* Features Section */}
             <section id="features" className="py-20 lg:py-32 bg-card/30">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl sm:text-4xl font-bold mb-4">Your Ultimate Study Companion</h2>
                        <p className="max-w-3xl mx-auto text-muted-foreground">
                            Neo X is packed with powerful features to help you study smarter, not harder.
                        </p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<BrainCircuit className="w-10 h-10" />}
                            title="AI Exam Predictor"
                            description="Upload your textbooks and past papers. Our AI analyzes them to forecast the most likely topics and questions for your upcoming exams."
                            delay={0}
                        />
                        <FeatureCard
                            icon={<FileQuestion className="w-10 h-10" />}
                            title="Quiz Generator"
                            description="Instantly create multiple-choice quizzes from your study materials to test your knowledge and identify areas for improvement."
                            delay={0.2}
                        />
                        <FeatureCard
                            icon={<MessageSquare className="w-10 h-10" />}
                            title="AI Chat Tutor"
                            description="Have a question? Chat with Neo X to get instant explanations, clarify doubts, and deepen your understanding of complex subjects."
                            delay={0.4}
                        />
                    </div>
                     <div className="mt-12 text-center text-muted-foreground">
                        <p>Supported file types: PDF | Max file size: 15MB</p>
                    </div>
                </div>
            </section>

            {/* How it Works */}
            <section className="py-20 lg:py-32">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                         <h2 className="text-3xl sm:text-4xl font-bold mb-4">Get Started in 3 Simple Steps</h2>
                    </div>
                    <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8 text-center">
                        <FeatureCard icon={<UploadCloud className="w-10 h-10 mx-auto" />} title="1. Upload" description="Securely upload your PDF textbooks and past question papers." />
                        <FeatureCard icon={<FileText className="w-10 h-10 mx-auto" />} title="2. Analyze" description="Choose a tool—Predictor, Quiz, or Chat—and let the AI work its magic." delay={0.2} />
                        <FeatureCard icon={<CheckCircle className="w-10 h-10 mx-auto" />} title="3. Excel" description="Use the AI-powered insights and results to focus your studying and ace your exams." delay={0.4} />
                    </div>
                </div>
            </section>
            
            {/* FAQ Section */}
            <section id="faq" className="py-20 lg:py-32 bg-grid">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl sm:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
                        <p className="max-w-2xl mx-auto text-muted-foreground">Got questions? We've got answers.</p>
                    </div>
                    <div className="max-w-3xl mx-auto">
                        <Accordion type="single" collapsible className="w-full space-y-4">
                            <div className="bg-card p-4 rounded-lg border">
                                <AccordionItem value="item-1" className="border-b-0">
                                    <AccordionTrigger>Is Neo X really free to use?</AccordionTrigger>
                                    <AccordionContent>
                                        Yes! Neo X is part of the E-SchoolBooks non-profit mission. We offer a generous free tier for all students. Your account comes with a free trial, and you can continue to use the service for free with some limits.
                                    </AccordionContent>
                                </AccordionItem>
                            </div>
                            <div className="bg-card p-4 rounded-lg border">
                                <AccordionItem value="item-2" className="border-b-0">
                                    <AccordionTrigger>How accurate are the exam predictions?</AccordionTrigger>
                                    <AccordionContent>
                                        Our AI is highly advanced, but it's important to remember that predictions are forecasts, not guarantees. They are designed to be a powerful study guide to help you focus on high-probability topics, but you should always study the entire syllabus.
                                    </AccordionContent>
                                </AccordionItem>
                            </div>
                            <div className="bg-card p-4 rounded-lg border">
                                <AccordionItem value="item-3" className="border-b-0">
                                    <AccordionTrigger>What happens to my uploaded documents?</AccordionTrigger>
                                    <AccordionContent>
                                        We take your privacy seriously. Your documents are securely uploaded and used solely for the purpose of generating your requested analysis (predictions, quizzes, or chat responses). We do not share your documents or use them for any other purpose. Please see our Privacy Policy for full details.
                                    </AccordionContent>
                                </AccordionItem>
                            </div>
                            <div className="bg-card p-4 rounded-lg border">
                                <AccordionItem value="item-4" className="border-b-0">
                                    <AccordionTrigger>What kind of files can I upload?</AccordionTrigger>
                                    <AccordionContent>
                                        Currently, Neo X supports PDF documents (.pdf) up to 15MB in size. We recommend uploading clean, text-based PDFs for the best results.
                                    </AccordionContent>
                                </AccordionItem>
                            </div>
                        </Accordion>
                    </div>
                </div>
            </section>
        </main>
        
        <footer id="contact" className="py-16 bg-background border-t border-border/20">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                {logoSrc && <Image src={logoSrc} alt="NeoX Logo" width={80} height={80} className="mx-auto mb-4"/>}
                <h2 className="text-2xl font-bold mb-2">Join E-SchoolBooks on This Journey</h2>
                <p className="text-muted-foreground mb-8">
                    Together, we can create a world where education knows no boundaries.
                </p>
                <div className="flex justify-center items-center gap-4 text-sm text-muted-foreground mb-8">
                    <Link href="/terms" className="hover:text-primary">Terms & Conditions</Link>
                    <span>•</span>
                    <Link href="/privacy" className="hover:text-primary">Privacy Policy</Link>
                </div>
                <div className="mt-8 text-sm text-muted-foreground">
                    © {new Date().getFullYear()} E-SchoolBooks Project by Theo. All Rights Reserved.
                </div>
            </div>
        </footer>
    </div>
  );
}

    