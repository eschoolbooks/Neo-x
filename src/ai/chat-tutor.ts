'use server';

import { getModel } from './gemini-client';

export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

export interface ChatResponse {
    response: string;
    relatedTopics?: string[];
}

/**
 * AI Chat Tutor for answering student questions
 */
export async function getChatResponse(
    userMessage: string,
    conversationHistory: ChatMessage[] = [],
    context?: {
        subject?: string;
        topic?: string;
        examType?: string;
    }
): Promise<ChatResponse> {

    if (!userMessage || userMessage.trim().length === 0) {
        throw new Error('Please provide a question');
    }

    const model = getModel();

    // Build conversation context
    const historyContext = conversationHistory
        .slice(-5) // Last 5 messages for context
        .map(msg => `${msg.role === 'user' ? 'Student' : 'Tutor'}: ${msg.content}`)
        .join('\n');

    const contextInfo = context
        ? `
**Context:**
${context.subject ? `- Subject: ${context.subject}` : ''}
${context.topic ? `- Topic: ${context.topic}` : ''}
${context.examType ? `- Exam: ${context.examType}` : ''}
`
        : '';

    const prompt = `You are Neo X, an AI tutor helping students prepare for competitive exams in India. Your role is to:
- Provide clear, accurate explanations
- Break down complex concepts into simple terms
- Use examples relevant to Indian exam patterns
- Encourage critical thinking
- Be supportive and patient

${contextInfo}

${historyContext ? `**Conversation History:**\n${historyContext}\n` : ''}

**Student Question:**
${userMessage}

**Instructions:**
1. Provide a clear, helpful answer
2. Use simple language suitable for students
3. Include examples if relevant
4. If the question is unclear, ask for clarification
5. Suggest related topics for further study

Respond naturally as a friendly tutor would.`;

    try {
        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        // Extract related topics if mentioned
        const relatedTopicsMatch = text.match(/Related topics?:(.+?)(?:\n|$)/i);
        const relatedTopics = relatedTopicsMatch
            ? relatedTopicsMatch[1].split(',').map(t => t.trim())
            : undefined;

        return {
            response: text.trim(),
            relatedTopics,
        };

    } catch (error) {
        console.error('Error in getChatResponse:', error);
        throw new Error('Failed to get response from AI tutor. Please try again.');
    }
}

/**
 * Get a quick hint for a specific question
 */
export async function getQuestionHint(
    question: string,
    subject: string
): Promise<string> {

    const model = getModel();

    const prompt = `Provide a helpful hint (not the full answer) for this ${subject} question:

${question}

Give a brief hint that guides the student toward the solution without revealing the complete answer.`;

    try {
        const result = await model.generateContent(prompt);
        const response = result.response;
        return response.text().trim();

    } catch (error) {
        console.error('Error in getQuestionHint:', error);
        throw new Error('Failed to generate hint. Please try again.');
    }
}
