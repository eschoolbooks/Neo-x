
'use client';

import Image from 'next/image';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function PrivacyPage() {
    const { resolvedTheme } = useTheme();
    const logoSrc = resolvedTheme === 'dark' ? '/NeoX_Logo_Dark.svg' : '/NeoX_Logo_Light.svg';

    const Section = ({ title, children }: { title: string, children: React.ReactNode }) => (
        <div className="mb-8">
            <h2 className="text-2xl font-bold text-primary mb-3">{title}</h2>
            <div className="space-y-4 text-muted-foreground">{children}</div>
        </div>
    );

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
                        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Privacy Policy</h1>
                        <p className="mt-4 text-lg text-muted-foreground">Your privacy is important to us. Here's how we handle your data.</p>
                         <p className="mt-2 text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
                    </div>

                    <Section title="Our Commitment to Your Privacy">
                        <p>Welcome to Neo X! We are part of E-SchoolBooks, a non-profit organization. Our mission is to provide free and accessible education, and that includes respecting your privacy. This policy explains what information we collect and how we use it in a simple, straightforward way.</p>
                    </Section>

                    <Section title="What Information Do We Collect?">
                        <p>To make Neo X work, we need to collect a little bit of information:</p>
                        <ul className="list-disc list-inside space-y-2">
                            <li><strong>Account Information:</strong> When you sign up, we collect your name, email address, and a password. If you sign in with Google, we get your name and email from them. We use this to create and manage your account.</li>
                            <li><strong>Uploaded Documents:</strong> When you use the Exam Predictor or Quiz Generator, you upload documents like textbooks and past papers. We use these documents to generate the AI responses you requested.</li>
                            <li><strong>AI Training Data:</strong> If you use the "AI Training Ground," the question papers you upload are used to make our AI models smarter and more accurate for everyone.</li>
                            <li><strong>Usage History:</strong> We save your prediction reports and quiz results to your account so you can access them later. We also keep a history of your chats with Neo X to make the conversation feel continuous.</li>
                        </ul>
                    </Section>

                    <Section title="How Do We Use Your Information?">
                        <p>Our goal is to help you learn, not to sell your data. Here’s how we use what we collect:</p>
                        <ul className="list-disc list-inside space-y-2">
                            <li><strong>To Provide the Service:</strong> We use your uploaded documents and chat history to power the AI features and give you personalized results.</li>
                            <li><strong>To Improve Our AI:</strong> The documents you provide, especially through the AI Training Ground, are essential for training our AI models. This helps us make our predictions more accurate and our tutor more helpful for all students. We do not use your personal account information for this.</li>
                            <li><strong>To Secure Your Account:</strong> Your login details are used to keep your account secure and private.</li>
                            <li><strong>To Communicate With You:</strong> We might use your email to send you important updates about our service, but we'll keep it minimal.</li>
                        </ul>
                    </Section>
                    
                    <Section title="How Do We Store and Protect Your Data?">
                        <p>We use Firebase, a platform by Google, to store your information securely. This includes your user account data and your uploaded files. We rely on Firebase's industry-standard security to protect your data from unauthorized access.</p>
                    </Section>

                    <Section title="Do We Share Your Data?">
                        <p><strong>No.</strong> We are a non-profit. We do not sell, trade, or rent your personal information to third parties. The documents you upload for AI analysis are processed by Google's Generative AI models, but they are not used for any purpose other than providing you with the requested AI features.</p>
                    </Section>

                    <Section title="Your Rights and Choices">
                        <p>You are in control of your data.</p>
                        <ul className="list-disc list-inside space-y-2">
                            <li><strong>Access Your History:</strong> You can view your past predictions and quizzes at any time from your account's history panel.</li>
                            <li><strong>Delete Your Account:</strong> If you wish to delete your account and all associated data, please contact us. We will process your request promptly.</li>
                        </ul>
                    </Section>

                    <Section title="Questions?">
                        <p>Your trust is the most important thing to us. If you have any questions or concerns about our Privacy Policy, please contact us at <a href="mailto:info@e-schoolbooks.in" className="text-primary underline">info@e-schoolbooks.in</a>. We're happy to chat about it!</p>
                    </Section>
                </div>
            </main>
        </div>
    );
}
