import { GoogleGenerativeAI } from '@google/generative-ai';

if (!process.env.GOOGLE_GEMINI_API_KEY) {
    throw new Error('GOOGLE_GEMINI_API_KEY is not configured in environment variables');
}

/**
 * Initialize Google Generative AI client with Gemini 2.5 Flash
 */
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);

/**
 * Get the Gemini 2.5 Flash model instance
 */
export function getModel() {
    return genAI.getGenerativeModel({
        model: 'gemini-2.0-flash-exp',
        generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 8192,
        },
    });
}

/**
 * Get model for processing files (with multimodal support)
 */
export function getMultimodalModel() {
    return genAI.getGenerativeModel({
        model: 'gemini-2.0-flash-exp',
        generationConfig: {
            temperature: 0.5, // Lower temperature for more focused extraction
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 8192,
        },
    });
}

export { genAI };
