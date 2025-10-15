'use server';
/**
 * @fileOverview A conversational AI flow for chatting with Neo X.
 *
 * - chatWithNeo - A function that handles the conversational chat with Neo X.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import {
  type ChatWithNeoInput,
  ChatWithNeoInputSchema,
  type ChatWithNeoOutput,
  ChatWithNeoOutputSchema,
} from './chatFlowSchemas';

export async function chatWithNeo(input: ChatWithNeoInput): Promise<ChatWithNeoOutput> {
  return chatWithNeoFlow(input);
}

const chatPrompt = ai.definePrompt({
  name: 'chatWithNeoPrompt',
  model: 'gemini-1.5-pro',
  input: {schema: ChatWithNeoInputSchema},
  output: {schema: z.object({ response: z.string() })},
  prompt: `You are Neo X, an advanced AI exam assistant from E-SchoolBooks. Your personality is helpful, encouraging, and an expert in educational topics. Your goal is to help the user understand concepts and answer their questions based on the provided documents and your general knowledge.

Keep your answers concise and easy to understand.

{{#if textbookPdfs}}
## Textbooks
These are the primary source of information. Refer to them as much as possible.
{{#each textbookPdfs}}
- Textbook Document: {{media url=this}}
{{/each}}
{{/if}}

{{#if questionPapers}}
## Previous Question Papers
Use these to understand the style and scope of past exam questions.
{{#each questionPapers}}
- Question Paper Document: {{media url=this}}
{{/each}}
{{/if}}

## Conversation History
{{#each history}}
- {{role}}: {{content}}
{{/each}}

## User's new question
- user: {{{query}}}

Based on the conversation history, the provided documents, and the user's new question, provide a helpful response.`,
});

const chatWithNeoFlow = ai.defineFlow(
  {
    name: 'chatWithNeoFlow',
    inputSchema: ChatWithNeoInputSchema,
    outputSchema: ChatWithNeoOutputSchema,
  },
  async (input) => {
    const {output} = await chatPrompt(input);
    if (!output) {
      throw new Error("The AI model did not return an output.");
    }
    return output;
  }
);
