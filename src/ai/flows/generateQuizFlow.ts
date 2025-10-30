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
  model: 'googleai/gemini-2.5-flash',
  input: {schema: GenerateQuizInputSchema},
  output: {schema: QuizSchema},
  prompt: `You are Neo X, an AI designed to help students learn. Your task is to generate a multiple-choice quiz based on the provided documents.

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

Please generate a quiz with {{numQuestions}} multiple-choice questions.

For each question:
1.  Create a clear and relevant question based on the key concepts in the documents.
2.  Provide four distinct options.
3.  One of the options must be the correct answer.
4.  The other three options should be plausible but incorrect (distractors).
5.  Specify which option is the correct answer.
6.  Provide a brief explanation for why the correct answer is right.

Structure the output as a quiz with a title and a list of questions.
`,
});


const generateQuizFlow = ai.defineFlow(
  {
    name: 'generateQuizFlow',
    inputSchema: GenerateQuizInputSchema,
    outputSchema: QuizSchema,
  },
  async (input) => {
    if (input.textbookPdfs.length === 0 && input.questionPapers.length === 0) {
      throw new Error("Please upload at least one textbook or question paper.");
    }
    const {output} = await generateQuizPrompt(input);
    if (!output) {
        throw new Error("The AI model did not return a quiz.");
    }
    return output;
  }
);
