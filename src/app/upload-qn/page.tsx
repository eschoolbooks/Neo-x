
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { LoaderCircle, FileUp, X, BrainCircuit, UploadCloud, Search, AlertTriangle, Sparkles, CheckCircle, Lightbulb } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';


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
  const [showDuplicatePreview, setShowDuplicatePreview] = useState(false);


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
    setShowDuplicatePreview(false);
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
            questions: JSON.stringify(result), // Store questions as a JSON string
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

    } catch (err) => {
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
  
  const QuestionList = ({ questions, title, description }: { questions: ProcessedQuestion[], title: string, description: string }) => (
    <Card>
        <CardHeader>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
            <ScrollArea className="max-h-[60vh] pr-4">
                <div className="space-y-6">
                    {questions.map((q: ProcessedQuestion, index: number) => (
                        <Card key={index} className="bg-muted/50">
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div className="flex items-start gap-4">
                                        <div className="flex-shrink-0 h-8 w-8 rounded-md bg-primary text-primary-foreground flex items-center justify-center font-bold">{index + 1}</div>
                                        <p className="font-semibold text-foreground pt-1">{q.questionText}</p>
                                    </div>
                                    {q.marks && <Badge variant="secondary">{q.marks} Mark{q.marks > 1 ? 's' : ''}</Badge>}
                                </div>
                            </CardHeader>
                            {q.options && q.options.length > 0 && (
                                <CardContent>
                                    <div className="space-y-2 mt-2 pl-12">
                                        <h4 className="font-medium text-sm text-muted-foreground">Options:</h4>
                                        <ul className="list-disc list-inside space-y-1 text-sm">
                                            {q.options.map((opt, i) => <li key={i}>{opt}</li>)}
                                        </ul>
                                    </div>
                                    {q.correctAnswer && <p className="text-sm mt-3 pl-12"><strong>Correct Answer:</strong> {q.correctAnswer}</p>}
                                </CardContent>
                            )}
                        </Card>
                    ))}
                </div>
            </ScrollArea>
        </CardContent>
    </Card>
);



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

            {!processedData && checkDone && duplicate && !allowUpload && !showDuplicatePreview && (
                <Card className='border-amber-500'>
                    <CardHeader>
                        <CardTitle className='flex items-center gap-2'><AlertTriangle className='text-amber-500'/>Similar Paper Found</CardTitle>
                        <CardDescription>
                           A question paper with these details already exists. Please review it to ensure you are not uploading a duplicate.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className='flex gap-4'>
                        <Button variant="outline" className='w-full' onClick={resetForm}>Start Over</Button>
                        <Button className='w-full' onClick={() => setShowDuplicatePreview(true)}>Review Existing Paper</Button>
                    </CardContent>
                </Card>
            )}

            {!processedData && showDuplicatePreview && (
                 <Card>
                    <CardHeader>
                        <CardTitle>Existing Question Paper</CardTitle>
                        <CardDescription>
                            This paper was uploaded on {new Date(duplicate.uploadedAt?.toDate()).toLocaleDateString()}. Please review the questions below.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <QuestionList
                            questions={typeof duplicate.questions === 'string' ? JSON.parse(duplicate.questions) : duplicate.questions}
                            title=""
                            description=""
                        />

                        <Alert className="mt-6 border-blue-500" variant="default">
                           <Lightbulb className="h-4 w-4" />
                           <AlertTitle>Re-upload Guidelines</AlertTitle>
                           <AlertDescription>
                                <p className="mb-2">Do **not** re-upload if:</p>
                                <ul className="list-disc list-inside text-xs space-y-1 pl-2">
                                    <li>Questions are the same but rearranged.</li>
                                    <li>Only the formatting (font, spacing, numbering) has changed.</li>
                                    <li>It's just a different file type (e.g., PDF vs. Word) of the same paper.</li>
                                    <li>There are only minor grammatical corrections.</li>
                                </ul>
                                <p className="mt-3 mb-2">You **should** re-upload if:</p>
                                <ul className="list-disc list-inside text-xs space-y-1 pl-2">
                                    <li>New or corrected questions have been added.</li>
                                    <li>There are major content revisions.</li>
                                    <li>Answer options or the mark scheme have been modified.</li>
                                </ul>
                           </AlertDescription>
                        </Alert>
                        <div className='flex flex-col gap-4 mt-6'>
                            <Button className='w-full' onClick={() => { setAllowUpload(true); setShowDuplicatePreview(false); }}>This is a different paper, let me upload</Button>
                            <Button variant="outline" className='w-full' onClick={resetForm}>Go Back</Button>
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
                <div>
                     <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold">Processing Complete!</h2>
                        <Button onClick={resetForm}>Upload Another</Button>
                    </div>
                     <p className="text-muted-foreground mb-4">Thank you for helping train Neo X! Here is the extracted data.</p>
               
                    <Tabs defaultValue="formatted" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="formatted">Formatted View</TabsTrigger>
                            <TabsTrigger value="json">JSON View</TabsTrigger>
                        </TabsList>
                        <TabsContent value="formatted" className="pt-4">
                            <QuestionList 
                                questions={processedData}
                                title=""
                                description=""
                            />
                        </TabsContent>
                        <TabsContent value="json" className="pt-4">
                             <Card>
                                <CardContent className="p-0">
                                    <ScrollArea className="max-h-[60vh]">
                                        <pre className="bg-muted/30 p-4 rounded-lg text-xs overflow-x-auto">
                                            {JSON.stringify(processedData, null, 2)}
                                        </pre>
                                    </ScrollArea>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            )}
        </div>
      </main>
    </div>
  );
}

    
