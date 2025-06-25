'use server';
/**
 * @fileOverview An AI flow for predicting exam topics.
 *
 * - predictExam - A function that analyzes textbooks and past papers to predict exam topics.
 * - PredictExamInput - The input type for the predictExam function.
 * - PredictExamOutput - The return type for the predictExam function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

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

export async function predictExam(input: PredictExamInput): Promise<PredictExamOutput> {
  return predictExamFlow(input);
}

const predictExamPrompt = ai.definePrompt({
  name: 'predictExamPrompt',
  input: {schema: PredictExamInputSchema},
  output: {schema: PredictExamOutputSchema},
  prompt: `You are Neo X, an advanced AI exam forecaster specializing in predicting questions for competitive exams in India. Your goal is to analyze the provided materials and predict the most important topics for the upcoming '{{examType}}' exam.

Use the following materials for your analysis. You must analyze the content of these documents.
{{#if textbookPdfs}}
## Textbooks
{{#each textbookPdfs}}
- Textbook Document: {{media url=this}}
{{/each}}
{{/if}}

{{#if questionPapers}}
## Previous Question Papers
{{#each questionPapers}}
- Question Paper Document: {{media url=this}}
{{/each}}
{{/if}}

Based on a thorough analysis of these documents and your general knowledge of current educational trends and exam patterns in India, please provide:
1.  **Predicted Key Topics**: A list of the most important topics. For each topic, provide a confidence score (from 0 to 100) indicating its likelihood of appearing on the exam, and a brief justification for your prediction.
2.  **Study Recommendations**: A list of actionable study recommendations based on your analysis to help a student focus their preparation effectively.

Your analysis must be sharp, insightful, and tailored to the '{{examType}}' exam.`,
});


const predictExamFlow = ai.defineFlow(
  {
    name: 'predictExamFlow',
    inputSchema: PredictExamInputSchema,
    outputSchema: PredictExamOutputSchema,
  },
  async (input) => {
    // A safeguard in case no files are provided.
    if (input.textbookPdfs.length === 0 && input.questionPapers.length === 0) {
      throw new Error("Please upload at least one textbook or question paper.");
    }
    const {output} = await predictExamPrompt(input);
    if (!output) {
        throw new Error("The AI model did not return an output.");
    }
    return output;
  }
);
