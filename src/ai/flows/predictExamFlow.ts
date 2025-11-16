'use server';
/**
 * @fileOverview An AI flow for predicting exam topics.
 *
 * - predictExam - A function that analyzes textbooks and past papers to predict exam topics.
 */

import { generate } from 'genkit/ai';
import { geminiPro } from '@genkit-ai/google-genai';
import {
  type PredictExamInput,
  PredictExamInputSchema,
  type PredictExamOutput,
  PredictExamOutputSchema,
} from './predictExamSchemas';
import { z } from 'zod';


export async function predictExam(input: PredictExamInput): Promise<PredictExamOutput> {
  // A safeguard in case no files are provided.
  if (input.documents.length === 0) {
    throw new Error("Please upload at least one textbook or question paper.");
  }
  
  const result = await generate({
      model: geminiPro,
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
2.  **Study Recommendations**: A list of actionable study recommendations based on your analysis to help a student focus their preparation effectively.

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

  const output = result.output();

  if (!output) {
      throw new Error("The AI model did not return an output.");
  }
  return output;
}
