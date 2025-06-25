/**
 * @fileOverview Zod schemas and TypeScript types for the predictExam flow.
 *
 * - PredictExamInputSchema - Zod schema for the input of the predictExam function.
 * - PredictExamInput - TypeScript type for the input of the predictExam function.
 * - PredictExamOutputSchema - Zod schema for the output of the predictExam function.
 * - PredictExamOutput - TypeScript type for the output of the predictExam function.
 */

import { z } from 'zod';

export const PredictExamInputSchema = z.object({
  examType: z.string().describe('The type of exam, e.g., "Plus 2", "NEET".'),
  textbookPdfs: z
    .array(z.string())
    .describe(
      "An array of textbook PDFs as data URIs. Expected format: 'data:application/pdf;base64,<encoded_data>'."
    ),
  questionPapers: z
    .array(z.string())
    .describe(
      "An array of previous year question paper PDFs as data URIs. Expected format: 'data:application/pdf;base64,<encoded_data>'."
    ),
});
export type PredictExamInput = z.infer<typeof PredictExamInputSchema>;

export const PredictExamOutputSchema = z.object({
  predictedTopics: z.array(
    z.object({
      topic: z.string().describe('The name of the predicted topic.'),
      confidence: z
        .number()
        .optional()
        .describe('A confidence score from 0 to 100 on how likely this topic is to appear.'),
      reason: z
        .string()
        .describe('A brief justification for why this topic was predicted.'),
    })
  ).describe('A list of topics that are likely to appear in the exam.'),
  studyRecommendations: z.array(
    z.string()
  ).describe('A list of actionable study recommendations.'),
});
export type PredictExamOutput = z.infer<typeof PredictExamOutputSchema>;
