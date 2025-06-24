'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  BookCheck,
  FileText,
  Loader2,
  Paperclip,
  UploadCloud,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { analyzeExamPapers } from '@/ai/flows/analyze-exam-papers';
import type { AnalysisResult } from '@/lib/types';
import { EmaLogo } from '@/components/icons';
import { AnalysisResults } from './analysis-results';

const formSchema = z.object({
  examType: z
    .string({ required_error: 'Please select an exam type.' })
    .min(1, 'Please select an exam type.'),
  examPapers:
    typeof window === 'undefined'
      ? z.any()
      : z
          .instanceof(FileList, { message: 'Exam papers PDF is required.' })
          .refine((files) => files?.length === 1, 'Exam papers PDF is required.'),
  textbooks:
    typeof window === 'undefined'
      ? z.any()
      : z
          .instanceof(FileList, { message: 'Textbook PDF is required.' })
          .refine((files) => files?.length === 1, 'Textbook PDF is required.'),
});

type FormValues = z.infer<typeof formSchema>;

const readFileAsDataURI = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export function EmaDashboard() {
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      examType: '',
    },
  });

  const examPapersFile = form.watch('examPapers');
  const textbooksFile = form.watch('textbooks');

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    setAnalysisResult(null);

    try {
      const examPapersDataUri = await readFileAsDataURI(data.examPapers[0]);
      const textbookDataUri = await readFileAsDataURI(data.textbooks[0]);

      const result = await analyzeExamPapers({
        examType: data.examType as any,
        examPapersDataUri,
        textbookDataUri,
      });

      setAnalysisResult(result);
    } catch (error) {
      console.error('Analysis failed:', error);
      toast({
        variant: 'destructive',
        title: 'Analysis Failed',
        description:
          'Something went wrong while analyzing your documents. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setAnalysisResult(null);
    form.reset();
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-8 rounded-lg bg-card/80 backdrop-blur-sm w-full max-w-md">
        <Loader2 className="w-16 h-16 animate-spin text-primary mb-6" />
        <h2 className="text-2xl font-bold tracking-tight text-foreground mb-2">
          Analyzing Documents...
        </h2>
        <p className="text-muted-foreground">
          EMA is working its magic. This may take a moment.
        </p>
      </div>
    );
  }

  if (analysisResult) {
    return <AnalysisResults result={analysisResult} onReset={handleReset} />;
  }

  return (
    <Card className="w-full max-w-2xl z-10 shadow-2xl bg-card/80 backdrop-blur-sm">
      <CardHeader className="text-center">
        <div className="flex justify-center items-center gap-3 mb-2">
            <EmaLogo className="w-8 h-8 text-primary" />
            <CardTitle className="text-3xl font-bold tracking-tighter">
                EMA: eSchool AI Exam Forecaster
            </CardTitle>
        </div>
        <CardDescription className="text-base">
          Upload past exam papers and textbooks to predict topics for your
          upcoming exams.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="examType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Exam Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an exam type..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Plus 2">Plus 2</SelectItem>
                      <SelectItem value="PSC">PSC</SelectItem>
                      <SelectItem value="NEET">NEET</SelectItem>
                      <SelectItem value="JEE">JEE</SelectItem>
                      <SelectItem value="Custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="examPapers"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Past Exam Papers</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <input
                          type="file"
                          id="examPapers"
                          accept=".pdf"
                          className="sr-only"
                          onChange={(e) => field.onChange(e.target.files)}
                        />
                        <label
                          htmlFor="examPapers"
                          className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted"
                        >
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <UploadCloud className="w-8 h-8 mb-2 text-muted-foreground" />
                            <p className="mb-1 text-sm text-muted-foreground">
                              <span className="font-semibold">Click to upload</span>
                            </p>
                            <p className="text-xs text-muted-foreground">PDF only</p>
                          </div>
                          {examPapersFile?.[0] && (
                            <div className="flex items-center text-xs text-foreground bg-background/80 px-2 py-1 rounded-full absolute bottom-2">
                                <FileText className="w-3 h-3 mr-1.5" />
                                <span className="truncate max-w-[150px]">{examPapersFile[0].name}</span>
                            </div>
                          )}
                        </label>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="textbooks"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Textbooks</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <input
                          type="file"
                          id="textbooks"
                          accept=".pdf"
                          className="sr-only"
                          onChange={(e) => field.onChange(e.target.files)}
                        />
                         <label
                          htmlFor="textbooks"
                          className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted"
                        >
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <UploadCloud className="w-8 h-8 mb-2 text-muted-foreground" />
                            <p className="mb-1 text-sm text-muted-foreground">
                              <span className="font-semibold">Click to upload</span>
                            </p>
                            <p className="text-xs text-muted-foreground">PDF only</p>
                          </div>
                          {textbooksFile?.[0] && (
                            <div className="flex items-center text-xs text-foreground bg-background/80 px-2 py-1 rounded-full absolute bottom-2">
                                <BookCheck className="w-3 h-3 mr-1.5" />
                                <span className="truncate max-w-[150px]">{textbooksFile[0].name}</span>
                            </div>
                          )}
                        </label>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
             <CardFooter className="p-0 pt-4">
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" size="lg">
                    Start Analysis
                </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
