
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { LoaderCircle, FileUp, X, BrainCircuit, UploadCloud, Search, AlertTriangle, Sparkles, CheckCircle } from 'lucide-react';
import { processQuestions } from '@/ai/flows/processQuestionsFlow';
import type { ProcessedQuestion } from '@/ai/flows/processQuestionsSchemas';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useTheme } from 'next-themes';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp, DocumentData } from 'firebase/firestore';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';


const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

// Moved FormFields outside the main component to prevent re-renders on state change
const FormFields = ({
  subject, setSubject,
  grade, setGrade,
  year, setYear,
  examType, setExamType,
  customExamType, setCustomExamType,
  disabled
}: {
  subject: string, setSubject: (val: string) => void,
  grade: string, setGrade: (val: string) => void,
  year: number | '', setYear: (val: number | '') => void,
  examType: string, setExamType: (val: string) => void,
  customExamType: string, setCustomExamType: (val: string) => void,
  disabled: boolean
}) => (
    <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input id="subject" placeholder="e.g., Physics" value={subject} onChange={e => setSubject(e.target.value)} required disabled={disabled}/>
        </div>
        <div className="space-y-2">
            <Label htmlFor="grade">Class / Grade</Label>
            <Input id="grade" placeholder="e.g., 12th Grade" value={grade} onChange={e => setGrade(e.target.value)} required disabled={disabled}/>
        </div>
        <div className="space-y-2">
            <Label htmlFor="year">Year</Label>
            <Input id="year" type="number" placeholder="e.g., 2023" value={year} onChange={e => setYear(e.target.value === '' ? '' : Number(e.target.value))} required disabled={disabled}/>
        </div>
            <div className="space-y-2">
            <Label htmlFor="exam-type">Exam Type</Label>
            <Select onValueChange={setExamType} value={examType} required disabled={disabled}>
                <SelectTrigger id="exam-type">
                    <SelectValue placeholder="Select an exam type..." />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="mid-term">Mid-Term</SelectItem>
                    <SelectItem value="semester">Semester</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                    <SelectItem value="board">Board</SelectItem>
                    <SelectItem value="competitive-neet">Competitive (NEET)</SelectItem>
                    <SelectItem value="competitive-jee">Competitive (JEE)</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                </SelectContent>
            </Select>
            {examType === 'other' && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="pt-2"
                >
                    <Label htmlFor="custom-exam-type">Specify Exam Type</Label>
                    <Input
                        id="custom-exam-type"
                        placeholder="Optional: e.g., University Entrance"
                        value={customExamType}
                        onChange={e => setCustomExamType(e.target.value)}
                        disabled={disabled}
                    />
                </motion.div>
            )}
        </div>
    </div>
);


export default function UploadQnPage() {
  const [file, setFile] = useState<File | null>(null);
  const [subject, setSubject] = useState('');
  const [year, setYear] = useState<number | ''>('');
  const [grade, setGrade] = useState('');
  const [examType, setExamType] = useState('');
  const [customExamType, setCustomExamType] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [processedData, setProcessedData] = useState<ProcessedQuestion[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [checkDone, setCheckDone] = useState(false);
  const [duplicate, setDuplicate] = useState<DocumentData | null>(null);
  const [allowUpload, setAllowUpload] = useState(false);

  const { toast } = useToast();
  const { resolvedTheme } = useTheme();
  const { user } = useUser();
  const firestore = useFirestore();

  const logoSrc = resolvedTheme === 'dark' ? '/NeoX_Logo_Dark.svg' : '/NeoX_Logo_Light.svg';

  const fileToDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
        if (selectedFile.size > MAX_FILE_SIZE_BYTES) {
            toast({
                title: 'File Too Large',
                description: `Please select a file smaller than ${MAX_FILE_SIZE_MB}MB.`,
                variant: 'destructive',
            });
            return;
        }
        setFile(selectedFile);
    }
  };
  
  const resetForm = () => {
    setFile(null);
    setSubject('');
    setYear('');
    setGrade('');
    setExamType('');
    setCustomExamType('');
    setIsLoading(false);
    setIsChecking(false);
    setProcessedData(null);
    setError(null);
    setCheckDone(false);
    setDuplicate(null);
    setAllowUpload(false);
  };

  const getFinalExamType = () => {
    return examType === 'other' && customExamType.trim() !== '' ? customExamType.trim() : examType;
  }

  const handleCheckForDuplicate = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalExamType = getFinalExamType();

    if (!subject || !year || !grade || !finalExamType) {
        toast({
            title: 'Missing Information',
            description: 'Please fill out all fields to check for duplicates.',
            variant: 'destructive',
        });
        return;
    }
    if (!firestore) {
        setError("Could not connect to the database.");
        return;
    }

    setIsChecking(true);
    setError(null);
    setDuplicate(null);
    
    try {
        const q = query(
            collection(firestore, "questionPapers"),
            where("subject", "==", subject),
            where("year", "==", Number(year)),
            where("grade", "==", grade),
            where("examType", "==", finalExamType)
        );

        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const firstDoc = querySnapshot.docs[0];
            setDuplicate(firstDoc.data());
        } else {
            // No duplicate found, allow upload
            setAllowUpload(true);
        }

    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred while checking.';
        setError(errorMessage);
    } finally {
        setIsChecking(false);
        setCheckDone(true);
    }
  }


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast({
        title: 'Missing File',
        description: 'Please upload a question paper.',
        variant: 'destructive',
      });
      return;
    }

    if (!firestore || !user) {
        setError("You must be logged in to upload a question paper.");
        return;
    }

    setIsLoading(true);
    setError(null);
    setProcessedData(null);
    const finalExamType = getFinalExamType();

    try {
        const documentDataUri = await fileToDataUri(file);
        const result = await processQuestions({
            document: documentDataUri,
            subject,
            year: Number(year),
            grade,
            examType: finalExamType,
        });

        const newPaper = {
            subject,
            year: Number(year),
            grade,
            examType: finalExamType,
            questions: result,
            isQlone: !!duplicate, // Flag as Qlone if a duplicate was found and user proceeded
            uploadedBy: user.uid,
            uploadedAt: serverTimestamp(),
        }

        await addDoc(collection(firestore, 'questionPapers'), newPaper);

        setProcessedData(result);
        toast({
            title: 'Upload & Processing Complete',
            description: `Successfully processed and saved ${result.length} questions.`,
        });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(errorMessage);
      toast({
        title: 'Processing Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="bg-background text-foreground min-h-screen">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/20">
        <nav className="container mx-auto flex items-center justify-between h-20 px-4 sm:px-6 lg:px-8">
            <a href="/" className="flex items-center gap-2">
                {logoSrc && <Image src={logoSrc} alt="NeoX Logo" width={40} height={40}/>}
                <span className="font-bold text-xl text-foreground">Neo X</span>
            </a>
            <div className="hidden md:flex items-center gap-8">
               <a href="/" className="hover:text-primary transition-colors">Home</a>
               <a href="/ai-hub" className="hover:text-primary transition-colors">AI Hub</a>
               <a href="/donate" className="hover:text-primary transition-colors">Donate</a>
            </div>
            <div className="flex items-center gap-4">
                <Button asChild className="rounded-full">
                  <a href="/donate">Donate</a>
                </Button>
            </div>
        </nav>
      </header>
      <main className="container mx-auto py-10 lg:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
            {!processedData && (
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold tracking-tighter mb-4">AI Training Ground</h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Upload question papers to train our AI. Your contributions help Neo X become smarter and more accurate for everyone.
                    </p>
                </div>
            )}

            {!processedData && !checkDone && (
                <Card className="shadow-2xl bg-card/80 backdrop-blur-sm mb-8">
                    <CardHeader>
                        <CardTitle>Step 1: Check for Existing Paper</CardTitle>
                        <CardDescription>First, let's see if this question paper already exists in our database to avoid duplicates.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleCheckForDuplicate} className="space-y-6">
                            <FormFields
                                subject={subject} setSubject={setSubject}
                                grade={grade} setGrade={setGrade}
                                year={year} setYear={setYear}
                                examType={examType} setExamType={setExamType}
                                customExamType={customExamType} setCustomExamType={setCustomExamType}
                                disabled={isChecking}
                            />
                            <Button type="submit" size="lg" className="w-full" disabled={isChecking}>
                                {isChecking ? <><LoaderCircle className="mr-2 h-4 w-4 animate-spin" />Checking...</> : <><Search className="mr-2 h-4 w-4" />Check for Existing Paper</>}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            )}

            {!processedData && checkDone && duplicate && !allowUpload && (
                <Card className='border-amber-500'>
                    <CardHeader>
                        <CardTitle className='flex items-center gap-2'><AlertTriangle className='text-amber-500'/>Duplicate Found</CardTitle>
                        <CardDescription>
                           A question paper with these details was already uploaded on {new Date(duplicate.uploadedAt?.toDate()).toLocaleDateString()}.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                        <Alert>
                           <Sparkles className="h-4 w-4" />
                           <AlertTitle>Is your paper different?</AlertTitle>
                           <AlertDescription>If this is a different version or a mismatch, you can still proceed. This will flag your upload for review.</AlertDescription>
                        </Alert>
                        <div className='flex gap-4'>
                            <Button variant="outline" className='w-full' onClick={resetForm}>Start Over</Button>
                            <Button className='w-full' onClick={() => setAllowUpload(true)}>This is a different paper</Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {!processedData && checkDone && allowUpload && (
            <Card className="shadow-2xl bg-card/80 backdrop-blur-sm mb-8 border-green-500">
                <CardHeader>
                    <CardTitle className='flex items-center gap-2'>
                        {duplicate ? <><AlertTriangle className='text-amber-500'/> Step 2: Upload New Version</> : <><CheckCircle className='text-green-500'/> Step 2: Upload New Paper</>}
                    </CardTitle>
                    <CardDescription>
                        {duplicate 
                            ? "Proceeding with a new version upload. This will be flagged as a 'Qlone'."
                            : "No duplicates found! Please upload the document to train the AI."
                        }
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <fieldset disabled>
                             <FormFields
                                subject={subject} setSubject={setSubject}
                                grade={grade} setGrade={setGrade}
                                year={year} setYear={setYear}
                                examType={examType} setExamType={setExamType}
                                customExamType={customExamType} setCustomExamType={setCustomExamType}
                                disabled={true}
                            />
                        </fieldset>

                        <div className="space-y-2">
                            <Label htmlFor="file-upload">Question Paper Document</Label>
                            {file ? (
                                <div className="flex items-center justify-between text-sm p-2 bg-muted rounded-md">
                                    <span className="truncate pr-2">{file.name}</span>
                                    <Button type="button" variant="ghost" size="icon" className="h-6 w-6 flex-shrink-0" onClick={() => setFile(null)}><X className="h-4 w-4" /></Button>
                                </div>
                            ) : (
                                <label htmlFor="file-upload" className={cn(`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg transition-colors cursor-pointer bg-card/50 hover:bg-muted border-input`)}>
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <UploadCloud className="w-8 h-8 mb-2 text-muted-foreground" />
                                        <p className="mb-1 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                        <p className="text-xs text-muted-foreground">PDF, DOCX, or TXT (Max ${MAX_FILE_SIZE_MB}MB)</p>
                                    </div>
                                    <input id="file-upload" type="file" className="hidden" accept=".pdf,.doc,.docx,.txt" onChange={handleFileChange} />
                                </label>
                            )}
                        </div>

                        <Button type="submit" size="lg" className="w-full" disabled={isLoading || !file}>
                            {isLoading ? <><LoaderCircle className="mr-2 h-4 w-4 animate-spin" />Processing...</> : <><BrainCircuit className="mr-2 h-4 w-4" />Process & Train</>}
                        </Button>
                        <Button variant="link" className='w-full' onClick={resetForm}>Start Over</Button>
                    </form>
                </CardContent>
            </Card>
            )}

            {isLoading && (
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><LoaderCircle className="animate-spin" /> Processing...</CardTitle>
                        <CardDescription>
                            The AI is analyzing your document. This may take a moment.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-20 w-full" />
                    </CardContent>
                </Card>
            )}


            {error && (
                <Card className="border-destructive">
                    <CardHeader>
                        <CardTitle className="text-destructive">An Error Occurred</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>{error}</p>
                         <Button onClick={resetForm} className="w-full mt-4">Try Again</Button>
                    </CardContent>
                </Card>
            )}

            {processedData && (
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Processing Complete!</CardTitle>
                            <CardDescription>
                                Thank you for helping train Neo X! Here is the extracted data.
                            </CardDescription>
                        </div>
                        <Button onClick={resetForm}>Upload Another</Button>
                    </CardHeader>
                    <CardContent>
                       <Tabs defaultValue="formatted" className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="formatted">Formatted View</TabsTrigger>
                                <TabsTrigger value="json">JSON View</TabsTrigger>
                            </TabsList>
                            <TabsContent value="formatted" className="pt-4">
                                <Accordion type="single" collapsible className="w-full">
                                    {processedData.map((q, index) => (
                                        <AccordionItem value={`item-${index}`} key={index}>
                                            <AccordionTrigger>{`Question ${index + 1}: ${q.questionText.substring(0, 80)}...`}</AccordionTrigger>
                                            <AccordionContent className="space-y-4">
                                                <p className="font-semibold text-foreground">{q.questionText}</p>
                                                {q.options && q.options.length > 0 && (
                                                    <div>
                                                        <h4 className="font-medium text-sm mb-2">Options:</h4>
                                                        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                                                            {q.options.map((opt, i) => <li key={i}>{opt}</li>)}
                                                        </ul>
                                                    </div>
                                                )}
                                                {q.correctAnswer && <p><strong>Correct Answer:</strong> {q.correctAnswer}</p>}
                                                {q.marks && <p><strong>Marks:</strong> {q.marks}</p>}
                                            </AccordionContent>
                                        </AccordionItem>
                                    ))}
                                </Accordion>
                            </TabsContent>
                            <TabsContent value="json" className="pt-4">
                                <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto max-h-[600px]">
                                    {JSON.stringify(processedData, null, 2)}
                                </pre>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            )}
        </div>
      </main>
    </div>
  );
}

    