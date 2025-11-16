
'use server';
/**
 * @fileOverview An AI flow for processing uploaded question papers into a structured format.
 *
 * - processQuestions - A function that analyzes a document and extracts questions into a structured "TOON" format.
 */

import { ai } from '@/ai/genkit';
import {
  type ProcessQuestionsInput,
  type ProcessedQuestion,
  ProcessedQuestionSchema,
} from './processQuestionsSchemas';

export async function processQuestions(input: ProcessQuestionsInput): Promise<ProcessedQuestion[]> {
  const { output } = await ai.generate({
    prompt: `You are a highly intelligent data processing engine. Your task is to analyze the provided document, which is a question paper, and extract every question into a structured JSON format.

You have been given metadata about this question paper:
- Subject: {{subject}}
- Year: {{year}}
- Class/Grade: {{grade}}
- Exam Type: {{examType}}

## Document for Analysis
{{media url=document}}

## Instructions
1.  Carefully read through the entire document.
2.  Identify every individual question.
3.  For each question, create a JSON object that includes:
    - The full 'questionText'.
    - An array of 'options' if it's a multiple-choice question.
    - The 'correctAnswer' if it can be determined.
    - The 'marks' allocated to the question if specified.
4.  Combine all the extracted question objects into a single JSON array.
5.  Use the provided metadata (subject, year, grade, examType) and the extracted information to populate the fields for each question object.

IMPORTANT: Your final output MUST be a valid JSON array of question objects and nothing else. Do not include any explanatory text, markdown formatting, or any content outside of the JSON array.
`,
    input: input,
    output: {
      schema: ProcessedQuestionSchema.array(),
    },
    config: {
      apiKey: process.env.GOOGLE_GEMINI_API_KEY,
    },
  });

  if (!output) {
    throw new Error("The AI model did not return a structured question array.");
  }
  return output;
}
