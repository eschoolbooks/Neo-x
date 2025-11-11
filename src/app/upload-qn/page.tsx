
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
import { Alert, AlertTitle } from '@/components/ui/alert';
import { motion } from 'framer-motion';


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
            <div className="text-center mb-12">
                <h1 className="text-4xl font-extrabold tracking-tighter mb-4">AI Training Ground</h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Upload question papers to train our AI. Your contributions help Neo X become smarter and more accurate for everyone.
                </p>
            </div>

            {!checkDone && (
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

            {checkDone && duplicate && !allowUpload && (
                <Card className='border-amber-500'>
                    <CardHeader>
                        <CardTitle className='flex items-center gap-2'><AlertTriangle className='text-amber-500'/>Duplicate Found</CardTitle>
                        <CardDescription>
                           A question paper with these details was already uploaded on {new Date(duplicate.uploadedAt?.toDate()).toLocaleDateString()}.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                         <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto max-h-60">
                            {JSON.stringify(duplicate.questions, null, 2)}
                        </pre>
                        <Alert>
                           <Sparkles className="h-4 w-4" />
                           <AlertTitle>Is your paper different?</AlertTitle>
                           <p className='text-sm text-muted-foreground'>If this is a different version or a mismatch, you can still proceed. This will flag your upload for review.</p>
                        </Alert>
                        <div className='flex gap-4'>
                            <Button variant="outline" className='w-full' onClick={resetForm}>Go Back</Button>
                            <Button className='w-full' onClick={() => setAllowUpload(true)}>This is a different paper</Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {checkDone && allowUpload && (
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


            {error && (
                <Card className="border-destructive">
                    <CardHeader>
                        <CardTitle className="text-destructive">An Error Occurred</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>{error}</p>
                    </CardContent>
                </Card>
            )}

            {processedData && (
              <>
                <Card>
                    <CardHeader>
                        <CardTitle>Processing Complete!</CardTitle>
                        <CardDescription>
                            Here is the structured TOON data extracted from the document. Thank you for helping train Neo X!
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
                            {JSON.stringify(processedData, null, 2)}
                        </pre>
                        <Button onClick={resetForm} className="w-full mt-4">Upload Another</Button>
                    </CardContent>
                </Card>
                <Accordion type="single" collapsible className="w-full mt-8">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>
                      <span className="font-semibold text-lg flex items-center gap-2">
                        <BrainCircuit className="h-5 w-5" />
                        Learn more about what just happened
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground space-y-4 pt-2">
                      <div>
                        <h4 className="font-semibold text-foreground mb-1">What is the AI Training Ground?</h4>
                        <p>
                          This page is the heart of our community-driven AI improvement process. By uploading question papers, you are directly contributing valuable data that helps Neo X become more intelligent and more accurate. Each document you provide is a new learning opportunity for our AI.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground mb-1">How is the AI Trained?</h4>
                        <p>
                          When you upload a document, our AI (powered by Google's Gemini model) analyzes the content. It doesn't just read the text; it understands the structure of the questions, options, and metadata. It then converts this unstructured information into a perfectly organized format called TOON. This clean, structured data is then used in future training cycles to improve the AI's ability to predict exam questions, generate quizzes, and answer your questions.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground mb-1">What is TOON?</h4>
                        <p>
                          <strong>TOON</strong> stands for <strong>Token Oriented Object Notation</strong>. It's a custom, highly structured data format we designed, similar to JSON. Instead of just raw text, TOON organizes every piece of information into a specific "token"—like `questionText`, `subject`, `year`, and `correctAnswer`.
                        </p>
                      </div>
                       <div>
                        <h4 className="font-semibold text-foreground mb-1">Why is TOON Important?</h4>
                        <p>
                          Computers and AI models thrive on structure. A simple PDF or text file is messy and inconsistent. By converting documents into the strict TOON format, we create a clean, reliable, and standardized dataset. This is the single most important step for effective AI training, as it allows the model to learn patterns and relationships from the data far more efficiently. Your contributions create the high-quality fuel that powers our AI.
                        </p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </>
            )}
        </div>
      </main>
    </div>
  );
}
