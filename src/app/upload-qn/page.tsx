'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { useUser } from '@/lib/supabase/provider';
import { uploadQuestionPaper } from '@/lib/supabase/storage';
import { createQuestionPaper, getQuestionPapers } from '@/lib/supabase/database';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileText, X, CheckCircle, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

const EXAM_TYPES = ['NEET', 'JEE Main', 'JEE Advanced', 'Plus 2', 'CBSE 12th', 'State Board', 'UPSC', 'Custom'];
const SUBJECTS = ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'English', 'Other'];
const BOARDS = ['CBSE', 'State Board', 'ICSE', 'ISC', 'Other'];

export default function UploadQuestionPage() {
    const router = useRouter();
    const { user, loading: authLoading } = useUser();
    const { toast } = useToast();
    const [files, setFiles] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);
    const [examType, setExamType] = useState('');
    const [subject, setSubject] = useState('');
    const [year, setYear] = useState('');
    const [board, setBoard] = useState('');
    const [uploadedPapers, setUploadedPapers] = useState<any[]>([]);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/auth');
            return;
        }

        if (user) {
            loadUploadedPapers();
        }
    }, [user, authLoading, router]);

    const loadUploadedPapers = async () => {
        const papers = await getQuestionPapers(user!.id);
        setUploadedPapers(papers);
    };

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const pdfFiles = acceptedFiles.filter(file => file.type === 'application/pdf');
        if (pdfFiles.length !== acceptedFiles.length) {
            toast({
                title: "Invalid files",
                description: "Only PDF files are allowed",
                variant: "destructive",
            });
        }
        setFiles(prev => [...prev, ...pdfFiles]);
    }, [toast]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'application/pdf': ['.pdf'] },
        maxSize: 15 * 1024 * 1024, // 15MB
    });

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleUpload = async () => {
        if (files.length === 0) {
            toast({
                title: "No files selected",
                description: "Please select at least one PDF file",
                variant: "destructive",
            });
            return;
        }

        if (!examType || !subject || !year) {
            toast({
                title: "Missing information",
                description: "Please fill in all required fields",
                variant: "destructive",
            });
            return;
        }

        setUploading(true);

        try {
            for (const file of files) {
                // Upload file to storage
                const fileUrl = await uploadQuestionPaper(file, user!.id);

                // Save metadata to database
                await createQuestionPaper({
                    user_id: user!.id,
                    title: file.name.replace('.pdf', ''),
                    exam_type: examType,
                    subject: subject,
                    year: parseInt(year),
                    board: board || null,
                    file_url: fileUrl,
                    file_size: file.size,
                    uploaded_by: user!.id,
                });
            }

            toast({
                title: "Upload successful!",
                description: `${files.length} question paper(s) uploaded successfully`,
            });

            setFiles([]);
            setExamType('');
            setSubject('');
            setYear('');
            setBoard('');
            loadUploadedPapers();
        } catch (error) {
            toast({
                title: "Upload failed",
                description: error instanceof Error ? error.message : "Failed to upload files",
                variant: "destructive",
            });
        } finally {
            setUploading(false);
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b border-border bg-card/50 backdrop-blur-sm">
                <div className="container mx-auto px-4 py-4">
                    <Button variant="ghost" asChild>
                        <Link href="/dashboard">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Dashboard
                        </Link>
                    </Button>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8 max-w-4xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-3xl font-bold mb-2">Upload Question Papers</h1>
                    <p className="text-muted-foreground">
                        Add previous year question papers for AI analysis and prediction
                    </p>
                </motion.div>

                {/* Upload Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mb-8"
                >
                    <Card>
                        <CardHeader>
                            <CardTitle>Upload PDF Files</CardTitle>
                            <CardDescription>Drag and drop or click to select PDF files (max 15MB each)</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div
                                {...getRootProps()}
                                className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                                    }`}
                            >
                                <input {...getInputProps()} />
                                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                                {isDragActive ? (
                                    <p className="text-foreground">Drop the files here...</p>
                                ) : (
                                    <div>
                                        <p className="text-foreground mb-2">Drop PDF files here or click to browse</p>
                                        <p className="text-sm text-muted-foreground">PDF files only, maximum 15MB per file</p>
                                    </div>
                                )}
                            </div>

                            {/* Selected Files */}
                            {files.length > 0 && (
                                <div className="mt-4 space-y-2">
                                    {files.map((file, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <FileText className="h-5 w-5 text-primary" />
                                                <div>
                                                    <p className="font-medium text-sm">{file.name}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {(file.size / 1024 / 1024).toFixed(2)} MB
                                                    </p>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removeFile(index)}
                                                disabled={uploading}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Metadata Form */}
                            {files.length > 0 && (
                                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="exam-type">Exam Type *</Label>
                                        <Select value={examType} onValueChange={setExamType} disabled={uploading}>
                                            <SelectTrigger id="exam-type">
                                                <SelectValue placeholder="Select exam type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {EXAM_TYPES.map(type => (
                                                    <SelectItem key={type} value={type}>{type}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="subject">Subject *</Label>
                                        <Select value={subject} onValueChange={setSubject} disabled={uploading}>
                                            <SelectTrigger id="subject">
                                                <SelectValue placeholder="Select subject" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {SUBJECTS.map(sub => (
                                                    <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="year">Year *</Label>
                                        <Input
                                            id="year"
                                            type="number"
                                            placeholder="2024"
                                            value={year}
                                            onChange={(e) => setYear(e.target.value)}
                                            disabled={uploading}
                                            min={2000}
                                            max={new Date().getFullYear()}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="board">Board (Optional)</Label>
                                        <Select value={board} onValueChange={setBoard} disabled={uploading}>
                                            <SelectTrigger id="board">
                                                <SelectValue placeholder="Select board" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {BOARDS.map(b => (
                                                    <SelectItem key={b} value={b}>{b}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            )}

                            {files.length > 0 && (
                                <Button
                                    className="w-full mt-6"
                                    onClick={handleUpload                  disabled={uploading}
                                >
                                    {uploading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Uploading...
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="mr-2 h-4 w-4" />
                                            Upload {files.length} File{files.length > 1 ? 's' : ''}
                                        </>
                                    )}
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Uploaded Papers */}
                {uploadedPapers.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle>Uploaded Question Papers</CardTitle>
                                <CardDescription>Your collection of question papers for analysis</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {uploadedPapers.map((paper) => (
                                        <div
                                            key={paper.id}
                                            className="flex items-center justify-between p-4 border border-border rounded-lg"
                                        >
                                            <div className="flex items-center gap-3">
                                                <CheckCircle className="h-5 w-5 text-green-500" />
                                                <div>
                                                    <p className="font-medium">{paper.title}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {paper.exam_type} • {paper.subject} • {paper.year}
                                                        {paper.board && ` • ${paper.board}`}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {new Date(paper.created_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </main>
        </div>
    );
}
