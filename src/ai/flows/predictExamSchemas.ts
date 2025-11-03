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
  documents: z
    .array(z.string())
    .describe(
      "An array of document PDFs as data URIs. These can be textbooks or question papers. Expected format: 'data:application/pdf;base64,<encoded_data>'."
    ),
});
export type PredictExamInput = z.infer<typeof PredictExamInputSchema>;

export const PredictExamOutputSchema = z.object({
  predictedTopics: z.array(
    z.object({
      subject: z.string().describe('The subject of the predicted topic (e.g., Physics, Biology).'),
      grade: z.string().describe("The grade or class level for the topic (e.g., '12th Grade', 'Plus 2')."),
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
