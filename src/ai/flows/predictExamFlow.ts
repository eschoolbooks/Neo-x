
'use server';
/**
 * @fileOverview An AI flow for predicting exam topics.
 *
 * - predictExam - A function that analyzes textbooks and past papers to predict exam topics.
 */

import { ai } from '@/ai/genkit';
import {
  type PredictExamInput,
  type PredictExamOutput,
  PredictExamOutputSchema,
} from './predictExamSchemas';


export async function predictExam(input: PredictExamInput): Promise<PredictExamOutput> {
  // A safeguard in case no files are provided.
  if (input.documents.length === 0) {
    throw new Error("Please upload at least one textbook or question paper.");
  }

  // Validate API key is configured
  if (!process.env.GOOGLE_GEMINI_API_KEY) {
    console.error('GOOGLE_GEMINI_API_KEY is not configured in environment variables');
    throw new Error("AI service configuration error. Please contact support.");
  }

  console.log('Starting prediction with exam type:', input.examType);
  console.log('Number of documents:', input.documents.length);

  try {
    const { output } = await ai.generate({
        prompt: `You are Neo X, an advanced AI exam forecaster specializing in predicting questions for competitive exams in India. Your goal is to analyze the provided materials and predict the most important topics for the upcoming '{{examType}}' exam.

Use the following materials for your analysis. You must analyze the content of all provided documents.
{{#if documents}}
## Provided Documents
{{#each documents}}
- Document: {{media url=this}}
{{/each}}
{{/if}}

Based on a thorough analysis of these documents and your general knowledge of current educational trends and exam patterns in India, please provide:
1.  **Predicted Key Topics**: A list of the most important topics. For each topic, provide:
    - The **subject** (e.g., Physics, Biology).
    - The **grade** or class level (e.g., '12th Grade', 'Plus 2').
    - The specific **topic** name.
    - A **confidence score** (from 0 to 100) indicating its likelihood of appearing on the exam.
    - A brief **justification** for your prediction.
2.  **Predicted Questions**: A list of up to 10 likely exam questions with their detailed answers.
3.  **Study Recommendations**: A list of actionable study recommendations based on your analysis to help a student focus their preparation effectively.

Your analysis must be sharp, insightful, and tailored to the '{{examType}}' exam.`,
        input: input,
        output: {
          schema: PredictExamOutputSchema,
        },
        config: {
          // Pass the API key at runtime from environment variables
          apiKey: process.env.GOOGLE_GEMINI_API_KEY,
        },
    });

    if (!output) {
        console.error('AI model returned empty output');
        throw new Error("The AI model did not return an output. Please try again.");
    }

    console.log('Prediction successful, topics count:', output.predictedTopics?.length || 0);
    return output;
  } catch (error) {
    console.error('Error in predictExam flow:', error);

    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('quota') || error.message.includes('429')) {
        throw new Error("AI service quota exceeded. Please try again later.");
      }
      if (error.message.includes('401') || error.message.includes('403')) {
        throw new Error("AI service authentication failed. Please contact support.");
      }
      if (error.message.includes('timeout')) {
        throw new Error("Request timed out. Please try with a smaller document.");
      }
      // Re-throw the original error if it's already user-friendly
      throw error;
    }

    throw new Error("An unexpected error occurred while generating predictions.");
  }
}
