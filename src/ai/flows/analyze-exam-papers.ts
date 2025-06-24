'use server';

/**
 * @fileOverview Exam paper analysis AI agent.
 *
 * - analyzeExamPapers - A function that handles the exam paper analysis process.
 * - AnalyzeExamPapersInput - The input type for the analyzeExamPapers function.
 * - AnalyzeExamPapersOutput - The return type for the analyzeExamPapers function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeExamPapersInputSchema = z.object({
  examPapersDataUri: z
    .string()
    .describe(
      "Past exam papers, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  textbookDataUri: z
    .string()
    .describe(
      "Textbooks, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  examType: z.enum(['Plus 2', 'PSC', 'NEET', 'JEE', 'Custom']).describe('The type of exam.'),
});
export type AnalyzeExamPapersInput = z.infer<typeof AnalyzeExamPapersInputSchema>;

const AnalyzeExamPapersOutputSchema = z.object({
  predictedTopics: z
    .array(z.string())
    .describe('The predicted topics for the upcoming exam.'),
  confidenceScores: z
    .array(z.number())
    .optional()
    .describe('Confidence scores for each predicted topic.'),
  studyRecommendations: z
    .string()
    .describe('Study recommendations based on the analysis.'),
});
export type AnalyzeExamPapersOutput = z.infer<typeof AnalyzeExamPapersOutputSchema>;

export async function analyzeExamPapers(
  input: AnalyzeExamPapersInput
): Promise<AnalyzeExamPapersOutput> {
  return analyzeExamPapersFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeExamPapersPrompt',
  input: {schema: AnalyzeExamPapersInputSchema},
  output: {schema: AnalyzeExamPapersOutputSchema},
  prompt: `You are an expert educational AI. Analyze the provided exam papers and textbooks to predict likely topics for the upcoming exam.

Exam Type: {{{examType}}}

Past Exam Papers: {{media url=examPapersDataUri}}

Textbooks: {{media url=textbookDataUri}}

Based on this information, predict the topics that are likely to appear on the exam, and provide study recommendations.

Format your response as follows:

Predicted Topics: [topic1, topic2, topic3, ...]
Confidence Scores (optional): [score1, score2, score3, ...]
Study Recommendations: [recommendation]
`,
});

const analyzeExamPapersFlow = ai.defineFlow(
  {
    name: 'analyzeExamPapersFlow',
    inputSchema: AnalyzeExamPapersInputSchema,
    outputSchema: AnalyzeExamPapersOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
