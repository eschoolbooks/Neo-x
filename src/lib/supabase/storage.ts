import { createClient } from './client';

const BUCKET_NAME = 'question-papers';
const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB

/**
 * Upload a question paper PDF to Supabase Storage
 */
export async function uploadQuestionPaper(
    file: File,
    userId: string,
    metadata?: Record<string, any>
): Promise<string> {
    // Validate file
    if (file.type !== 'application/pdf') {
        throw new Error('Only PDF files are allowed');
    }

    if (file.size > MAX_FILE_SIZE) {
        throw new Error('File size must be less than 15MB');
    }

    const supabase = createClient();

    // Generate unique file path
    const timestamp = new Date().getTime();
    const fileName = `${userId}/${timestamp}-${file.name}`;

    // Upload file
    const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(fileName, file, {
            contentType: 'application/pdf',
            upsert: false,
            metadata,
        });

    if (error) {
        console.error('Upload error:', error);
        throw new Error(`Failed to upload file: ${error.message}`);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(fileName);

    return publicUrl;
}

/**
 * Download a question paper from Supabase Storage
 */
export async function downloadQuestionPaper(filePath: string): Promise<Blob> {
    const supabase = createClient();

    const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .download(filePath);

    if (error) {
        throw new Error(`Failed to download file: ${error.message}`);
    }

    return data;
}

/**
 * Delete a question paper from Supabase Storage
 */
export async function deleteQuestionPaperFile(filePath: string): Promise<void> {
    const supabase = createClient();

    const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([filePath]);

    if (error) {
        throw new Error(`Failed to delete file: ${error.message}`);
    }
}

/**
 * Get the file URL from storage
 */
export function getQuestionPaperUrl(filePath: string): string {
    const supabase = createClient();

    const { data } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath);

    return data.publicUrl;
}

/**
 * List all question papers for a user
 */
export async function listUserQuestionPapers(userId: string) {
    const supabase = createClient();

    const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .list(userId, {
            sortBy: { column: 'created_at', order: 'desc' },
        });

    if (error) {
        throw new Error(`Failed to list files: ${error.message}`);
    }

    return data;
}
