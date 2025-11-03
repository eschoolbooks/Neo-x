/**
 * @fileOverview Zod schemas and TypeScript types for the chatWithNeo flow.
 *
 * - ChatWithNeoInputSchema - Zod schema for the input of the chatWithNeo function.
 * - ChatWithNeoInput - TypeScript type for the input of the chatWithNeo function.
 * - ChatWithNeoOutputSchema - Zod schema for the output of the chatWithNeo function.
 * - ChatWithNeoOutput - TypeScript type for the output of the chatWithNeo function.
 */

import { z } from 'zod';

const ChatHistorySchema = z.object({
    role: z.enum(['user', 'model']),
    content: z.string(),
});

export const ChatWithNeoInputSchema = z.object({
  query: z.string().describe("The user's message to Neo X."),
  documents: z
    .array(z.string())
    .describe(
      "An array of document PDFs as data URIs. These can be textbooks or question papers. Expected format: 'data:application/pdf;base64,<encoded_data>'."
    ),
  history: z.array(ChatHistorySchema).describe('The conversation history.'),
});
export type ChatWithNeoInput = z.infer<typeof ChatWithNeoInputSchema>;

export const ChatWithNeoOutputSchema = z.object({
  response: z.string().describe("Neo X's response to the user's query."),
});
export type ChatWithNeoOutput = z.infer<typeof ChatWithNeoOutputSchema>;
