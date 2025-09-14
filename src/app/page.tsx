'use client';

import { useState, useEffect, useRef } from 'react';
import type { SVGProps } from 'react';
import Image from 'next/image';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowRight, Book, CheckCircle, Heart, Leaf, Mail, Phone, Users, Zap, BrainCircuit, FileUp, Lightbulb, LoaderCircle, X, GraduationCap, Sparkles, MessageCircle } from 'lucide-react';
import CountUp from 'react-countup';
import { predictExam } from '@/ai/flows/predictExamFlow';
import type { PredictExamOutput } from '@/ai/flows/predictExamSchemas';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { Chat } from '@/components/chat';
import { chatWithNeo } from '@/ai/flows/chatFlow';
import type { ChatWithNeoInput } from '@/ai/flows/chatFlowSchemas';


const StatCard = ({ icon, value, label, suffix, duration = 2 }: { icon: React.ReactNode; value: number; label: string; suffix?: string; duration?: number }) => {
  const controls = useAnimation();
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.5 });
  const [didAnimate, setDidAnimate] = useState(false);

  useEffect(() => {
    if (inView && !didAnimate) {
      controls.start("visible");
      setDidAnimate(true);
    }
  }, [controls, inView, didAnimate]);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={{
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
      }}
      className="text-center"
    >
      <div className="text-primary mx-auto mb-4">{icon}</div>
      <div className="text-4xl md:text-5xl font-extrabold text-foreground">
        {didAnimate && <CountUp end={value} duration={duration} separator="," />}
        {suffix}
      </div>
      <p className="text-muted-foreground mt-2">{label}</p>
    </motion.div>
  );
};

const FeatureCard = ({ icon, title, description, delay = 0 }: { icon: React.ReactNode; title: string; description: string; delay?: number }) => {
    const controls = useAnimation();
    const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.3 });

    useEffect(() => {
        if (inView) {
            controls.start("visible");
        }
    }, [controls, inView]);
    
    return (
        <motion.div
            ref={ref}
            initial="hidden"
            animate={controls}
            variants={{
                hidden: { opacity: 0, y: 50 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay } },
            }}
            className="p-6 rounded-lg bg-card/50 backdrop-blur-sm border border-border/20"
        >
            <div className="text-accent mb-4">{icon}</div>
            <h3 className="text-xl font-bold text-foreground mb-2">{title}</h3>
            <p className="text-muted-foreground">{description}</p>
        </motion.div>
    );
};

const slideVariants = {
  enter: (direction: number) => {
    return {
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    };
  },
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => {
    return {
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    };
  },
};


export default function Home() {
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
    
    // Persist data URIs for chat
    const [textbookDataUris, setTextbookDataUris] = useState<string[]>([]);
    const [questionPaperDataUris, setQuestionPaperDataUris] = useState<string[]>([]);

    const [currentSlide, setCurrentSlide] = useState(0);

    const slides = [
      {
        logo: "https://media.licdn.com/dms/image/v2/D4E0BAQETuF_JEMo6MQ/company-logo_200_200/company-logo_200_200/0/1685716892227?e=2147483647&v=beta&t=vAW_vkOt-KSxA9tSNdgNszeTgz9l_UX0nkz0S_jDSz8",
        title: <>Lighten Their Bags.<br /><span className="text-primary">Brighten Their Future.</span></>,
        subtitle: "We're on a mission to save students from back pain and save nature through digital books. Join us in rewriting the future of education.",
        buttons: [
          { text: "Support Our Mission", href: "#donate", variant: "default", icon: <ArrowRight className="ml-2 h-5 w-5" /> },
        ],
      },
      {
        logo: "https://media.licdn.com/dms/image/v2/D4E0BAQETuF_JEMo6MQ/company-logo_200_200/company-logo_200_200/0/1685716892227?e=2147483647&v=beta&t=vAW_vkOt-KSxA9tSNdgNszeTgz9l_UX0nkz0S_jDSz8",
        title: <span className="text-primary">Taking Education beyond Boundaries</span>,
        subtitle: "A mission to make students able to self-learn, choose their own future, and build a great nation by helping today's generation find their pathway.",
        buttons: [
          { text: "Support Our Mission", href: "#donate", variant: "default" },
          { text: "Join Our Mission", href: "#contact", variant: "secondary" },
        ],
      },
    ];

    const [[page, direction], setPage] = useState([0, 0]);
    const slideIndex = page % slides.length;

    const paginate = (newDirection: number) => {
      setPage([page + newDirection, newDirection]);
    };
    
    useEffect(() => {
        const interval = setInterval(() => {
            paginate(1);
        }, 5000);
        return () => clearInterval(interval);
    }, [page]);


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
        if (fileType === 'textbooks') {
            setTextbooks(prev => [...prev, ...newFiles]);
            const uris = await Promise.all(newFiles.map(fileToDataUri));
            setTextbookDataUris(prev => [...prev, ...uris]);
        } else {
            setQuestionPapers(prev => [...prev, ...newFiles]);
            const uris = await Promise.all(newFiles.map(fileToDataUri));
            setQuestionPaperDataUris(prev => [...prev, ...uris]);
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
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

    const handleChatSubmit = async (query: string) => {
      const newUserMessage = { role: 'user', content: query };
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
        const newModelMessage = { role: 'model', content: result.response };
        setChatHistory([...newHistory, newModelMessage]);

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
        const errorResponseMessage = {role: 'model', content: `Sorry, I ran into an error: ${errorMessage}`};
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
    <div className="bg-background text-foreground overflow-x-hidden">
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/20">
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-20">
          <a href="#" className="flex items-center gap-2">
            <Image src="https://media.licdn.com/dms/image/v2/D4E0BAQETuF_JEMo6MQ/company-logo_200_200/company-logo_200_200/0/1685716892227?e=2147483647&v=beta&t=vAW_vkOt-KSxA9tSNdgNszeTgz9l_UX0nkz0S_jDSz8" alt="E-SchoolBooks Logo" width={40} height={40} className="rounded-full"/>
            <span className="font-bold text-xl text-foreground">E-SchoolBooks</span>
          </a>
          <div className="hidden md:flex items-center gap-8">
            <a href="#vision" className="hover:text-primary transition-colors">Our Vision</a>
            <a href="#ema-project" className="hover:text-primary transition-colors">AI Projects</a>
            <a href="#impact" className="hover:text-primary transition-colors">Impact</a>
            <a href="#contact" className="hover:text-primary transition-colors">Contact</a>
          </div>
          <Button asChild className="rounded-full animate-pulse-strong">
            <a href="#donate">
              Donate Now <Heart className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </nav>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-background via-indigo-950/20 to-background opacity-50"></div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]"></div>

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <AnimatePresence initial={false} custom={direction}>
              <motion.div
                key={page}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 },
                }}
                className="absolute inset-0 flex flex-col items-center justify-center"
              >
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <Image src={slides[slideIndex].logo} alt="E-SchoolBooks Logo" width={128} height={128} className="rounded-full mx-auto mb-6 animate-float"/>
                </motion.div>
                <motion.h1 
                    className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tighter text-foreground mb-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                  {slides[slideIndex].title}
                </motion.h1>
                <motion.p 
                    className="max-w-3xl mx-auto text-lg md:text-xl text-muted-foreground mb-10"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                >
                  {slides[slideIndex].subtitle}
                </motion.p>
                <motion.div
                    className="flex gap-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                >
                    {slides[slideIndex].buttons.map((button, index) => (
                      <Button key={index} size="lg" asChild className="rounded-full text-lg px-10 py-6" variant={button.variant as any}>
                          <a href={button.href}>
                              {button.text} {button.icon}
                          </a>
                      </Button>
                    ))}
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>
          
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex space-x-3 z-20">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setPage([index, index > slideIndex ? 1 : -1])}
                className={`w-3 h-3 rounded-full transition-colors ${
                  slideIndex === index ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>

        </section>

        {/* The Problem & Solution Section */}
        <section className="py-20 lg:py-32 bg-card/30">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, amount: 0.5 }}
                        transition={{ duration: 0.7 }}
                    >
                        <Image src="https://placehold.co/600x400.png" alt="Student with heavy backpack" width={600} height={400} className="rounded-xl shadow-2xl" data-ai-hint="child sad backpack" />
                        <h2 className="text-3xl font-bold mt-6 mb-3 text-red-400">The Unseen Burden</h2>
                        <p className="text-muted-foreground">Millions of students suffer from chronic back pain, shoulder, and spinal cord issues from carrying heavy backpacks daily. This physical strain hinders their ability to learn and thrive.</p>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, amount: 0.5 }}
                        transition={{ duration: 0.7, delay: 0.2 }}
                    >
                        <Image src="https://placehold.co/600x400.png" alt="Student learning with a tablet" width={600} height={400} className="rounded-xl shadow-2xl" data-ai-hint="child happy tablet" />
                        <h2 className="text-3xl font-bold mt-6 mb-3 text-accent">A Lighter Path Forward</h2>
                        <p className="text-muted-foreground">E-SchoolBooks provides a simple, powerful solution: free digital textbooks. We eliminate heavy loads, promote better health, and create a more sustainable, eco-friendly learning environment for all.</p>
                    </motion.div>
                </div>
            </div>
        </section>

        {/* Vision Section */}
        <section id="vision" className="py-20 lg:py-32 bg-card/30">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                 <div className="text-center mb-12">
                    <h2 className="text-3xl sm:text-4xl font-bold mb-4">Our Vision for a Better World</h2>
                    <p className="max-w-3xl mx-auto text-muted-foreground">
                        At E-SchoolBooks, we believe education is the cornerstone of a bright future. Our vision is to bridge the gap between students and learning resources, ensuring every child has access to quality educational materials.
                    </p>
                </div>
                 <div className="grid md:grid-cols-3 gap-8 text-center">
                    <FeatureCard icon={<Zap className="w-10 h-10"/>} title="Innovative Learning" description="We create an interactive digital experience that mirrors physical books, making learning more engaging and accessible." delay={0} />
                    <FeatureCard icon={<Leaf className="w-10 h-10"/>} title="Sustainable Edge" description="By reducing the demand for printed textbooks, we champion an eco-friendly approach, saving countless trees." delay={0.2} />
                    <FeatureCard icon={<Heart className="w-10 h-10"/>} title="Empowering Students" description="Currently serving Kerala students, we are dedicated to fostering a love for learning and creating a generation of confident individuals." delay={0.4} />
                 </div>
            </div>
        </section>

        {/* AI Projects Section */}
        <section id="ema-project" className="py-20 lg:py-32">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                        Our AI Initiatives
                    </h2>
                     <p className="max-w-3xl mx-auto text-muted-foreground">
                        We are leveraging Artificial Intelligence to create groundbreaking tools that personalize and revolutionize the learning experience for every student.
                    </p>
                </div>
                
                {/* Project EMA */}
                <div className="grid md:grid-cols-2 gap-12 items-center mb-24">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, amount: 0.5 }}
                        transition={{ duration: 0.7 }}
                    >
                        <Image 
                            src="https://placehold.co/600x500.png" 
                            alt="AI EMA Project illustration" 
                            width={600} 
                            height={500} 
                            className="rounded-xl shadow-2xl" 
                            data-ai-hint="futuristic robot education" 
                        />
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, amount: 0.5 }}
                        transition={{ duration: 0.7, delay: 0.2 }}
                    >
                        <h3 className="text-2xl font-bold mb-2">Project EMA: Your Personal Tutor</h3>
                        <p className="text-primary mb-6 font-semibold">Educational Mentor Assistant</p>
                        <ul className="space-y-6">
                            <li className="flex items-start">
                                <div className="flex-shrink-0">
                                    <CheckCircle className="h-7 w-7 text-accent" />
                                </div>
                                <div className="ml-4">
                                    <h4 className="text-lg font-semibold text-foreground">Personalized Learning Paths</h4>
                                    <p className="text-muted-foreground mt-1">AI adapts to each student's pace and style, offering tailored exercises and explanations.</p>
                                </div>
                            </li>
                            <li className="flex items-start">
                                 <div className="flex-shrink-0">
                                    <CheckCircle className="h-7 w-7 text-accent" />
                                </div>
                                <div className="ml-4">
                                    <h4 className="text-lg font-semibold text-foreground">24/7 Tutoring Support</h4>
                                    <p className="text-muted-foreground mt-1">Instant help with homework, concepts, and exam preparation, anytime, anywhere.</p>
                                </div>
                            </li>
                            <li className="flex items-start">
                                 <div className="flex-shrink-0">
                                    <CheckCircle className="h-7 w-7 text-accent" />
                                </div>
                                <div className="ml-4">
                                    <h4 className="text-lg font-semibold text-foreground">Interactive & Engaging</h4>
                                    <p className="text-muted-foreground mt-1">Goes beyond static PDFs with interactive quizzes and gamified lessons.</p>
                                </div>
                            </li>
                        </ul>
                    </motion.div>
                </div>
            </div>
        </section>

        {/* Neo X AI Exam Forecaster Section */}
        <section id="neo-x" className="py-20 lg:py-32 bg-card/30">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl sm:text-4xl font-bold mb-2">
                        Meet <span className="text-primary">Neo X</span>
                    </h2>
                     <p className="text-lg text-muted-foreground mb-4">Your AI Exam Forecaster</p>
                    <p className="max-w-3xl mx-auto text-muted-foreground">
                        Upload previous year's question papers and textbook PDFs. Neo X will analyze them, identify patterns, and predict the most likely topics for your upcoming exams.
                    </p>
                </div>

                <Card className="max-w-4xl mx-auto shadow-2xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BrainCircuit className="text-primary" />
                            Create New Exam Prediction
                        </CardTitle>
                        <CardDescription>The more documents you provide, the more accurate the prediction.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* File Uploads */}
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="textbooks" className="text-lg font-semibold">Textbooks (PDF)</Label>
                                    <div className="flex items-center justify-center w-full">
                                        <label htmlFor="textbooks-input" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-background hover:bg-muted">
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
                                                <span>{file.name}</span>
                                                <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleRemoveFile(index, 'textbooks')}><X className="h-4 w-4" /></Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="question-papers" className="text-lg font-semibold">Question Papers (PDF)</Label>
                                    <div className="flex items-center justify-center w-full">
                                        <label htmlFor="question-papers-input" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-background hover:bg-muted">
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
                                                <span>{file.name}</span>
                                                <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleRemoveFile(index, 'questionPapers')}><X className="h-4 w-4" /></Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            
                            {/* Exam Type Selection */}
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

                            {/* Submit Button */}
                            <div>
                                <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
                                    {isLoading ? (
                                        <>
                                            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                                            Analyzing...
                                        </>
                                    ) : (
                                        'Predict My Exam'
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Results Section */}
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
        </section>


        {/* Impact Section */}
        <section id="impact" className="py-20 lg:py-32">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h2 className="text-3xl sm:text-4xl font-bold mb-4">Our Impact, By the Numbers</h2>
                <p className="max-w-2xl mx-auto text-muted-foreground mb-16">
                    Every contribution, big or small, helps us grow our reach and transform more lives.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <StatCard icon={<Users className="w-12 h-12" />} value={15} label="Passionate Team Members" />
                    <StatCard icon={<Book className="w-12 h-12" />} value={5000} suffix="+" label="Free Textbooks Provided" />
                    <StatCard icon={<Leaf className="w-12 h-12" />} value={1000} suffix="+" label="Trees Saved" />
                </div>
            </div>
        </section>

        {/* Donate Section */}
        <section id="donate" className="py-20 lg:py-32">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-gradient-to-r from-primary to-orange-500 text-primary-foreground rounded-2xl p-8 md:p-16 text-center shadow-2xl">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true, amount: 0.5 }}
                        transition={{ duration: 0.7 }}
                    >
                        <h2 className="text-4xl md:text-6xl font-extrabold mb-4">Even ₹1 Can Rewrite a Future.</h2>
                        <p className="text-lg md:text-xl max-w-2xl mx-auto mb-8 opacity-90">
                            Your small contribution has a massive impact. It helps us digitize another book, save another tree, and ease the burden for another child. Join the movement.
                        </p>
                        <Button variant="secondary" size="lg" asChild className="rounded-full text-lg px-10 py-6 bg-white text-primary hover:bg-gray-200">
                           <a href="#">
                             Donate Securely <Heart className="ml-2 h-5 w-5 fill-current"/>
                           </a>
                        </Button>
                    </motion.div>
                </div>
            </div>
        </section>

        {/* Team Section */}
        <section className="py-20 lg:py-32 bg-card/30">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                 <h2 className="text-3xl sm:text-4xl font-bold mb-4">Meet the Hearts Behind the Mission</h2>
                <p className="max-w-2xl mx-auto text-muted-foreground mb-12">
                    E-SchoolBooks is a project by <strong className="text-primary">"Theo,"</strong> a non-profit founded by Kevin Anjo. We are a passionate force of 15 educators, technologists, and dreamers united for change.
                </p>
                <div className="flex justify-center -space-x-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Image
                            key={i}
                            src={`https://placehold.co/100x100.png`}
                            alt={`Team member ${i + 1}`}
                            width={100}
                            height={100}
                            className="rounded-full border-4 border-background"
                             data-ai-hint="person portrait"
                        />
                    ))}
                </div>
            </div>
        </section>

        {/* Contact Section */}
        <footer id="contact" className="py-16 bg-background border-t border-border/20">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <Image src="https://media.licdn.com/dms/image/v2/D4E0BAQETuF_JEMo6MQ/company-logo_200_200/company-logo_200_200/0/1685716892227?e=2147483647&v=beta&t=vAW_vkOt-KSxA9tSNdgNszeTgz9l_UX0nkz0S_jDSz8" alt="E-SchoolBooks Logo" width={80} height={80} className="rounded-full mx-auto mb-4"/>
                <h2 className="text-2xl font-bold mb-2">Join Us on This Journey</h2>
                <p className="text-muted-foreground mb-8">
                    Together, we can create a world where education knows no boundaries.
                </p>
                <div className="flex justify-center items-center gap-6 text-muted-foreground">
                    <a href="mailto:info@e-schoolbooks.in" className="flex items-center gap-2 hover:text-primary"><Mail className="h-5 w-5" /> info@e-schoolbooks.in</a>
                    <a href="tel:+919946882478" className="flex items-center gap-2 hover:text-primary"><Phone className="h-5 w-5" /> +91 9946882478</a>
                </div>
                <div className="mt-8 text-sm text-muted-foreground">
                    © {new Date().getFullYear()} E-SchoolBooks Project by Theo. All Rights Reserved.
                </div>
            </div>
        </footer>
      </main>

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
    </div>
  );
}
