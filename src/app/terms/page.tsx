
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const Section = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div className="mb-8">
        <h2 className="text-2xl font-bold text-primary mb-3">{title}</h2>
        <div className="space-y-4 text-muted-foreground">{children}</div>
    </div>
);

export default function TermsPage() {
    const { resolvedTheme } = useTheme();
    const [logoSrc, setLogoSrc] = useState('/NeoX_Logo_Light.svg'); // Default to one version

    useEffect(() => {
        // Set the logo based on the theme only after mounting on the client
        setLogoSrc(resolvedTheme === 'dark' ? '/NeoX_Logo_Dark.svg' : '/NeoX_Logo_Light.svg');
    }, [resolvedTheme]);

    return (
        <div className="bg-background text-foreground">
            <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/20">
                <nav className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-20">
                <a href="/" className="flex items-center gap-2">
                    {logoSrc && <Image src={logoSrc} alt="NeoX Logo" width={40} height={40} priority />}
                    <span className="font-bold text-xl text-foreground">Neo X</span>
                </a>
                <Button asChild variant="outline">
                    <Link href="/ai-hub">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to AI Hub
                    </Link>
                </Button>
                </nav>
            </header>

            <main className="container mx-auto py-12 md:py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Terms and Conditions</h1>
                        <p className="mt-4 text-lg text-muted-foreground">The simple, friendly guide to using our platform.</p>
                        <p className="mt-2 text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
                    </div>

                    <Section title="Welcome to Neo X!">
                        <p>Hey there! We're thrilled to have you. These terms are here to explain the rules for using our AI tools. Think of them as a friendly agreement between you and E-SchoolBooks. By using Neo X, you're agreeing to these terms, so please give them a read.</p>
                    </Section>

                    <Section title="Your Account">
                        <p>To use most of our features, you'll need an account. It's your responsibility to keep your account details safe. You're in charge of all the activity that happens under your account, so if you think someone else is using it, please let us know right away!</p>
                    </Section>

                    <Section title="Using Our AI Tools">
                        <p>Neo X is designed to help you study smarter. You can upload your textbooks and question papers to get predictions, generate quizzes, and chat with our AI tutor. Here's the deal:</p>
                        <ul className="list-disc list-inside space-y-2">
                            <li><strong>Be Responsible:</strong> Use our tools for learning and studying. Please don't use them to cheat on exams or submit AI-generated work as your own. The goal is to help you learn, not do the work for you.</li>
                            <li><strong>Don't Upload Sensitive Info:</strong> Please don't upload documents that contain personal, private, or sensitive information about yourself or others.</li>
                        </ul>
                    </Section>

                    <Section title="Your Content vs. Our Content">
                        <p>This part is important. Let's talk about who owns what.</p>
                        <ul className="list-disc list-inside space-y-2">
                            <li><strong>Your Uploads:</strong> The documents you upload (like your textbooks or past papers) are still yours. You own them. By uploading, you're just giving us permission to use them to provide you with our AI services (like making predictions or generating quizzes).</li>
                            <li><strong>AI-Generated Content:</strong> The predictions, quizzes, and chat responses created by Neo X are for your personal, educational use. You can download them, study from them, and share them with friends.</li>
                            <li><strong>AI Training:</strong> When you upload a question paper to our "AI Training Ground," you are granting us a permanent, worldwide right to use that content to improve our AI models for the benefit of all students.</li>
                        </ul>
                    </Section>

                    <Section title="Respect the Community">
                        <p>E-SchoolBooks is a community built on trust and a shared passion for learning. We ask that you don't use our services to:</p>
                        <ul className="list-disc list-inside space-y-2">
                            <li>Upload anything illegal, harmful, or that infringes on someone else's copyright.</li>
                            <li>Try to hack, break, or disrupt our services.</li>
                            <li>Use our platform to bully or harass others.</li>
                        </ul>
                    </Section>

                    <Section title="Our Service is 'As Is'">
                        <p>Neo X is an experimental AI tool. While we work hard to make it accurate and helpful, we can't guarantee it will always be perfect. The predictions are based on patterns and are not a promise of what will be on your exam. Always use them as a study guide, not a crystal ball!</p>
                    </Section>

                     <Section title="Changes to These Terms">
                        <p>We may update these terms from time to time as our service grows. If we make major changes, we'll do our best to let you know. Continuing to use Neo X after the changes means you agree to the new terms.</p>
                    </Section>

                    <Section title="Questions?">
                        <p>If you have any questions about these terms, please don't hesitate to reach out to us at <a href="mailto:info@e-schoolbooks.in" className="text-primary underline">info@e-schoolbooks.in</a>. We're here to help!</p>
                    </Section>
                </div>
            </main>
        </div>
    );
}
