'use server';

import { getModel } from './gemini-client';

export interface QuizQuestion {
    question: string;
    options: string[];
    correctAnswer: number; // Index of correct option (0-3)
    explanation: string;
    topic: string;
    difficulty: 'easy' | 'medium' | 'hard';
}

export interface QuizResult {
    questions: QuizQuestion[];
    topic: string;
    totalQuestions: number;
}

/**
 * Generate a practice quiz based on a specific topic
 */
export async function generateQuiz(
    topic: string,
    subject: string,
    numberOfQuestions: number = 10,
    difficulty?: 'easy' | 'medium' | 'hard'
): Promise<QuizResult> {

    if (numberOfQuestions < 5 || numberOfQuestions > 20) {
        throw new Error('Number of questions must be between 5 and 20');
    }

    const model = getModel();

    const prompt = `Generate a practice quiz for students preparing for competitive exams.

**Quiz Details:**
- Topic: ${topic}
- Subject: ${subject}
- Number of Questions: ${numberOfQuestions}
${difficulty ? `- Difficulty Level: ${difficulty}` : '- Difficulty Level: Mixed (easy, medium, hard)'}

**Instructions:**
1. Create ${numberOfQuestions} multiple-choice questions (4 options each)
2. Questions should be exam-style and relevant to ${topic}
3. Provide clear explanations for correct answers
4. Vary difficulty levels appropriately
5. Ensure questions test understanding, not just memorization

**Response Format:**
Provide your response as a valid JSON object:
{
  "questions": [
    {
      "question": "The question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Why this is the correct answer",
      "topic": "${topic}",
      "difficulty": "medium"
    }
  ]
}

Generate exactly ${numberOfQuestions} high-quality questions.`;

    try {
        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        // Extract JSON from response
        let jsonText = text.trim();
        if (jsonText.startsWith('```json')) {
            jsonText = jsonText.replace(/^```json\n/, '').replace(/\n```$/, '');
        } else if (jsonText.startsWith('```')) {
            jsonText = jsonText.replace(/^```\n/, '').replace(/\n```$/, '');
        }

        const parsed = JSON.parse(jsonText);

        const questions: QuizQuestion[] = parsed.questions || [];

        return {
            questions,
            topic,
            totalQuestions: questions.length,
        };

    } catch (error) {
        console.error('Error in generateQuiz:', error);
        throw new Error('Failed to generate quiz. Please try again.');
    }
}
