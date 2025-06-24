'use server';
/**
 * @fileOverview Generates study recommendations based on the analysis of exam papers and textbooks.
 *
 * - generateStudyRecommendations - A function that generates study recommendations.
 * - GenerateStudyRecommendationsInput - The input type for the generateStudyRecommendations function.
 * - GenerateStudyRecommendationsOutput - The return type for the generateStudyRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateStudyRecommendationsInputSchema = z.object({
  examType: z.string().describe('The type of exam for which to generate study recommendations (e.g., Plus 2, PSC, NEET, JEE).'),
  analysisResults: z.string().describe('The AI analysis results of the uploaded exam papers and textbooks.'),
});
export type GenerateStudyRecommendationsInput = z.infer<typeof GenerateStudyRecommendationsInputSchema>;

const GenerateStudyRecommendationsOutputSchema = z.object({
  studyRecommendations: z.string().describe('Specific study recommendations based on the analysis results, including topics to focus on and suggested resources.'),
});
export type GenerateStudyRecommendationsOutput = z.infer<typeof GenerateStudyRecommendationsOutputSchema>;

export async function generateStudyRecommendations(input: GenerateStudyRecommendationsInput): Promise<GenerateStudyRecommendationsOutput> {
  return generateStudyRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateStudyRecommendationsPrompt',
  input: {schema: GenerateStudyRecommendationsInputSchema},
  output: {schema: GenerateStudyRecommendationsOutputSchema},
  prompt: `You are an AI-powered study assistant that provides personalized study recommendations based on the analysis of exam papers and textbooks.

  Exam Type: {{{examType}}}
  Analysis Results: {{{analysisResults}}}

  Based on the analysis results, provide specific and actionable study recommendations. Focus on identifying key topics that the student should concentrate on to improve their exam performance. Also provide links to Khan Academy and other online resources.
  The output should be in the form of an ordered list.
  `,
});

const generateStudyRecommendationsFlow = ai.defineFlow(
  {
    name: 'generateStudyRecommendationsFlow',
    inputSchema: GenerateStudyRecommendationsInputSchema,
    outputSchema: GenerateStudyRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
