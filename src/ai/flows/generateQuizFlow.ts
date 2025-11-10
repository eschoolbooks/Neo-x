
'use server';
/**
 * @fileOverview An AI flow for generating quizzes.
 *
 * - generateQuiz - A function that analyzes documents and creates a multiple-choice quiz.
 */

import {ai} from '@/ai/genkit';
import {
  type GenerateQuizInput,
  GenerateQuizInputSchema,
  type Quiz,
  QuizSchema,
} from './generateQuizSchemas';


export async function generateQuiz(input: GenerateQuizInput): Promise<Quiz> {
  return generateQuizFlow(input);
}

const generateQuizPrompt = ai.definePrompt({
  name: 'generateQuizPrompt',
  model: 'googleai/gemini-1.5-flash-latest',
  input: {schema: GenerateQuizInputSchema},
  output: {schema: QuizSchema},
  prompt: `You are Neo X, an AI designed to help students learn. Your task is to generate a multiple-choice quiz based on the provided document(s).

You must analyze the content of the following document(s) to create the quiz.
{{#if documents}}
## Provided Documents
{{#each documents}}
- Document: {{media url=this}}
{{/each}}
{{/if}}

Please generate a quiz with {{numQuestions}} multiple-choice questions.

For each question:
1.  Create a clear and relevant question based on the key concepts in the documents.
2.  Provide four distinct options.
3.  One of the options must be the correct answer.
4.  The other three options should be plausible but incorrect (distractors).
5.  Specify which option is the correct answer.
6.  Provide a brief but thorough explanation for why the correct answer is right. This is crucial for learning.

IMPORTANT: Your response MUST be a valid JSON object that strictly adheres to the provided output schema. Do NOT include any extra text, markdown, or explanations outside of the JSON structure.
`,
});


const generateQuizFlow = ai.defineFlow(
  {
    name: 'generateQuizFlow',
    inputSchema: GenerateQuizInputSchema,
    outputSchema: QuizSchema,
    experimentalRetries: 3, // Add retry logic
  },
  async (input) => {
    if (input.documents.length === 0) {
      throw new Error("Please upload at least one textbook or question paper.");
    }
    const {output} = await generateQuizPrompt(input);
    if (!output) {
        throw new Error("The AI model did not return a quiz.");
    }
    return output;
  }
);

    
