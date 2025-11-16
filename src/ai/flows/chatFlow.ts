
'use server';
/**
 * @fileOverview A conversational AI flow for chatting with Neo X.
 *
 * - chatWithNeo - A function that handles the conversational chat with Neo X.
 */

import { ai } from '@/ai/genkit';
import {
  type ChatWithNeoInput,
  type ChatWithNeoOutput,
  ChatWithNeoOutputSchema,
} from './chatFlowSchemas';

export async function chatWithNeo(input: ChatWithNeoInput): Promise<ChatWithNeoOutput> {
    const { output } = await ai.generate({
        prompt: `You are Neo X, an advanced AI exam assistant from E-SchoolBooks. Your personality is helpful, encouraging, and an expert in educational topics. Your goal is to help the user understand concepts and answer their questions based on the provided documents and your general knowledge.

Keep your answers concise and easy to understand.

{{#if documents}}
## Documents
These are the primary source of information. Refer to them as much as possible.
{{#each documents}}
- Document: {{media url=this}}
{{/each}}
{{/if}}

## Conversation History
{{#each history}}
- {{role}}: {{content}}
{{/each}}

## User's new question
- user: {{{query}}}

Based on the conversation history, the provided documents, and the user's new question, provide a helpful response.`,
        input: input,
        output: {
            schema: ChatWithNeoOutputSchema,
        },
        config: {
            apiKey: process.env.GOOGLE_GEMINI_API_KEY,
        },
    });
    
    if (!output) {
      throw new Error("The AI model did not return an output.");
    }
    return output;
}
