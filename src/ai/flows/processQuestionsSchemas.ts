/**
 * @fileOverview Zod schemas and TypeScript types for the processQuestions flow.
 */

import { z } from 'zod';

export const ProcessQuestionsInputSchema = z.object({
  document: z.string().describe(
    "A document (PDF, DOCX, TXT) as a data URI. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
  ),
  subject: z.string().describe('The subject of the question paper (e.g., Physics).'),
  year: z.number().describe('The year the exam was held (e.g., 2023).'),
  grade: z.string().describe("The class or grade level (e.g., '12th Grade')."),
  examType: z.string().describe('The type of exam (e.g., "Board", "NEET").'),
});
export type ProcessQuestionsInput = z.infer<typeof ProcessQuestionsInputSchema>;


export const ProcessedQuestionSchema = z.object({
    questionText: z.string().describe("The full text of the extracted question."),
    options: z.array(z.string()).optional().describe("An array of multiple-choice options, if available."),
    correctAnswer: z.string().optional().describe("The correct answer, if specified in the document."),
    marks: z.number().optional().describe("The marks allocated for the question, if specified."),
    subject: z.string().describe('The subject of the question paper.'),
    year: z.number().describe('The year the exam was held.'),
    grade: z.string().describe("The class or grade level."),
    examType: z.string().describe('The type of exam.'),
});
export type ProcessedQuestion = z.infer<typeof ProcessedQuestionSchema>;
