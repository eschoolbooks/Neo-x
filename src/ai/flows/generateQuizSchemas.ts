/**
 * @fileOverview Zod schemas and TypeScript types for the generateQuiz flow.
 */

import { z } from 'zod';

export const GenerateQuizInputSchema = z.object({
  numQuestions: z.number().min(1).max(20).describe('The number of questions to generate for the quiz.'),
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
export type GenerateQuizInput = z.infer<typeof GenerateQuizInputSchema>;

export const QuizQuestionSchema = z.object({
    questionText: z.string().describe("The text of the quiz question."),
    options: z.array(z.string()).length(4).describe("A list of four possible answers."),
    correctAnswer: z.string().describe("The correct answer from the options list."),
    explanation: z.string().describe("A brief explanation of why the answer is correct."),
});
export type QuizQuestion = z.infer<typeof QuizQuestionSchema>;

export const QuizSchema = z.object({
  title: z.string().describe("The title of the generated quiz."),
  questions: z.array(QuizQuestionSchema).describe("A list of quiz questions."),
});
export type Quiz = z.infer<typeof QuizSchema>;
