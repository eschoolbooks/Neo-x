'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { LoaderCircle, FileUp, X, BrainCircuit, UploadCloud } from 'lucide-react';
import { processQuestions } from '@/ai/flows/processQuestionsFlow';
import type { ProcessedQuestion } from '@/ai/flows/processQuestionsSchemas';
import Image from 'next/image';
import { cn } from '@/lib/utils';

const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export default function UploadQnPage() {
  const [file, setFile] = useState<File | null>(null);
  const [subject, setSubject] = useState('');
  const [year, setYear] = useState<number | ''>('');
  const [grade, setGrade] = useState('');
  const [examType, setExamType] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [processedData, setProcessedData] = useState<ProcessedQuestion[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { toast } = useToast();

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

  const handleRemoveFile = () => {
    setFile(null);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !subject || !year || !grade || !examType) {
      toast({
        title: 'Missing Information',
        description: 'Please fill out all fields and upload a question paper.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    setProcessedData(null);

    try {
        const documentDataUri = await fileToDataUri(file);
        const result = await processQuestions({
            document: documentDataUri,
            subject,
            year: Number(year),
            grade,
            examType,
        });
        setProcessedData(result);
        toast({
            title: 'Processing Complete',
            description: `Successfully processed ${result.length} questions.`,
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
                <Image src="https://media.licdn.com/dms/image/v2/D4E0BAQETuF_JEMo6MQ/company-logo_200_200/company-logo_200_200/0/1685716892227?e=2147483647&v=beta&t=vAW_vkOt-KSxA9tSNdgNszeTgz9l_UX0nkz0S_jDSz8" alt="E-SchoolBooks Logo" width={40} height={40} className="rounded-full"/>
                <span className="font-bold text-xl text-foreground">E-SchoolBooks</span>
            </a>
            <div className="hidden md:flex items-center gap-8">
               <a href="/" className="hover:text-primary transition-colors">Home</a>
               <a href="/ai-hub" className="hover:text-primary transition-colors">AI Hub</a>
            </div>
            <Button asChild className="rounded-full">
              <a href="/donate">Donate</a>
            </Button>
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

            <Card className="shadow-2xl bg-card/80 backdrop-blur-sm mb-8">
                <CardHeader>
                    <CardTitle>Upload a Question Paper</CardTitle>
                    <CardDescription>Provide the document and its details. The AI will process it into a structured format.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="subject">Subject</Label>
                                <Input id="subject" placeholder="e.g., Physics" value={subject} onChange={e => setSubject(e.target.value)} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="grade">Class / Grade</Label>
                                <Input id="grade" placeholder="e.g., 12th Grade" value={grade} onChange={e => setGrade(e.target.value)} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="year">Year</Label>
                                <Input id="year" type="number" placeholder="e.g., 2023" value={year} onChange={e => setYear(Number(e.target.value))} required />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="exam-type">Exam Type</Label>
                                <Select onValueChange={setExamType} value={examType} required>
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
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="file-upload">Question Paper Document</Label>
                            {file ? (
                                <div className="flex items-center justify-between text-sm p-2 bg-muted rounded-md">
                                    <span className="truncate pr-2">{file.name}</span>
                                    <Button type="button" variant="ghost" size="icon" className="h-6 w-6 flex-shrink-0" onClick={handleRemoveFile}><X className="h-4 w-4" /></Button>
                                </div>
                            ) : (
                                <label htmlFor="file-upload" className={cn(`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg transition-colors cursor-pointer bg-card/50 hover:bg-muted border-input`)}>
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <UploadCloud className="w-8 h-8 mb-2 text-muted-foreground" />
                                        <p className="mb-1 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                        <p className="text-xs text-muted-foreground">PDF, DOCX, or TXT (Max {MAX_FILE_SIZE_MB}MB)</p>
                                    </div>
                                    <input id="file-upload" type="file" className="hidden" accept=".pdf,.doc,.docx,.txt" onChange={handleFileChange} />
                                </label>
                            )}
                        </div>

                        <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
                            {isLoading ? <><LoaderCircle className="mr-2 h-4 w-4 animate-spin" />Processing...</> : <><BrainCircuit className="mr-2 h-4 w-4" />Process & Train</>}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {isLoading && (
                <div className="text-center p-8">
                    <LoaderCircle className="h-12 w-12 mx-auto animate-spin text-primary mb-4" />
                    <p className="text-muted-foreground">Neo X is analyzing the document... Please wait.</p>
                </div>
            )}

            {error && (
                <Card className="border-destructive">
                    <CardHeader>
                        <CardTitle className="text-destructive">Processing Failed</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>{error}</p>
                    </CardContent>
                </Card>
            )}

            {processedData && (
                <Card>
                    <CardHeader>
                        <CardTitle>Processed TOON Data</CardTitle>
                        <CardDescription>
                            Here is the structured data extracted from the document. This data can now be used for training.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
                            {JSON.stringify(processedData, null, 2)}
                        </pre>
                    </CardContent>
                </Card>
            )}
        </div>
      </main>
    </div>
  );
}
