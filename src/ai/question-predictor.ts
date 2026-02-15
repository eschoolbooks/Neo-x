'use server';

import { getModel } from './gemini-client';
import type { Database } from '@/lib/supabase/database.types';

type QuestionPaper = Database['public']['Tables']['question_papers']['Row'];

export interface PredictedTopic {
    topic: string;
    subject: string;
    confidence: number; // 0-100
    justification: string;
    priority: 'high' | 'medium' | 'low';
    estimatedHours: number;
}

export interface PredictedQuestion {
    question: string;
    answer: string;
    topic: string;
    confidence: number;
    difficulty: 'easy' | 'medium' | 'hard';
    type: 'mcq' | 'short_answer' | 'long_answer' | 'numerical';
}

export interface StudyRecommendation {
    title: string;
    description: string;
    priority: number;
    estimatedHours: number;
}

export interface PredictionResult {
    predictedTopics: PredictedTopic[];
    predictedQuestions: PredictedQuestion[];
    studyRecommendations: StudyRecommendation[];
    totalConfidenceScore: number;
    processingTimeSeconds: number;
}

/**
 * Main function to predict exam questions based on previous year papers
 */
export async function predictExamQuestions(
    examType: string,
    subject: string,
    questionPapers: QuestionPaper[],
    targetExamDate?: Date
): Promise<PredictionResult> {
    const startTime = Date.now();

    if (questionPapers.length === 0) {
        throw new Error('Please provide at least one question paper for analysis');
    }

    const model = getModel();

    // Prepare the analysis context
    const papersContext = questionPapers
        .map((paper, index) => {
            return `
### Question Paper ${index + 1}
- Year: ${paper.year}
- Exam: ${paper.exam_type}
- Subject: ${paper.subject}
- Board: ${paper.board || 'N/A'}

**Content:**
${paper.extracted_text || '(Content extraction pending)'}
${paper.extracted_questions && Array.isArray(paper.extracted_questions) && paper.extracted_questions.length > 0
                    ? `\n**Extracted Questions:**\n${JSON.stringify(paper.extracted_questions, null, 2)}`
                    : ''}
`;
        })
        .join('\n---\n');

    const prompt = `You are Neo X, an advanced AI exam forecaster specifically trained to analyze previous year question papers and predict likely questions for upcoming exams.

**Task:** Analyze the provided previous year question papers for ${examType} (${subject}) and predict:
1. The most likely topics to appear
2. Predicted questions with detailed answers
3. Strategic study recommendations

**Previous Year Question Papers:**
${papersContext}

**Additional Context:**
- Exam Type: ${examType}
- Subject: ${subject}
${targetExamDate ? `- Target Exam Date: ${targetExamDate.toDateString()}` : ''}
- Number of Papers Analyzed: ${questionPapers.length}
- Years Covered: ${questionPapers.map(p => p.year).join(', ')}

**Instructions:**
1. Identify patterns in topics that appear repeatedly across years
2. Note topics that have increasing frequency in recent years  
3. Consider the syllabus structure and exam format for ${examType}
4. Generate realistic, exam-style questions
5. Provide actionable study recommendations

**Response Format:**
Provide your response as a valid JSON object with this structure:
{
  "predictedTopics": [
    {
      "topic": "Name of the topic",
      "subject": "${subject}",
      "confidence": 85,
      "justification": "Why this topic is likely to appear",
      "priority": "high",
      "estimatedHours": 4
    }
  ],
  "predictedQuestions": [
    {
      "question": "The predicted question text",
      "answer": "Detailed answer to the question",
      "topic": "Related topic name",
      "confidence": 80,
      "difficulty": "medium",
      "type": "mcq" or "short_answer" or "long_answer" or "numerical"
    }
  ],
  "studyRecommendations": [
    {
      "title": "Recommendation title",
      "description": "Detailed recommendation",
      "priority": 1,
      "estimatedHours": 3
    }
  ]
}

Provide at least 8-12 predicted topics, 10-15 predicted questions, and 5-8 study recommendations.
Ensure all confidence scores are realistic and based on the evidence from the papers.`;

    try {
        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        // Extract JSON from response (handling markdown code blocks)
        let jsonText = text.trim();
        if (jsonText.startsWith('```json')) {
            jsonText = jsonText.replace(/^```json\n/, '').replace(/\n```$/, '');
        } else if (jsonText.startsWith('```')) {
            jsonText = jsonText.replace(/^```\n/, '').replace(/\n```$/, '');
        }

        const parsed = JSON.parse(jsonText);

        // Validate and calculate total confidence
        const predictedTopics: PredictedTopic[] = parsed.predictedTopics || [];
        const predictedQuestions: PredictedQuestion[] = parsed.predictedQuestions || [];
        const studyRecommendations: StudyRecommendation[] = parsed.studyRecommendations || [];

        const totalConfidenceScore = predictedTopics.length > 0
            ? predictedTopics.reduce((sum, topic) => sum + topic.confidence, 0) / predictedTopics.length
            : 0;

        const processingTimeSeconds = (Date.now() - startTime) / 1000;

        return {
            predictedTopics,
            predictedQuestions,
            studyRecommendations,
            totalConfidenceScore: Math.round(totalConfidenceScore * 100) / 100,
            processingTimeSeconds: Math.round(processingTimeSeconds * 100) / 100,
        };

    } catch (error) {
        console.error('Error in predictExamQuestions:', error);

        if (error instanceof Error) {
            if (error.message.includes('quota') || error.message.includes('429')) {
                throw new Error('AI service quota exceeded. Please try again later.');
            }
            if (error.message.includes('401') || error.message.includes('403')) {
                throw new Error('AI service authentication failed. Please check API key configuration.');
            }
            if (error.message.toLowerCase().includes('json')) {
                throw new Error('Failed to parse AI response. Please try again.');
            }
        }

        throw new Error('An unexpected error occurred while generating predictions. Please try again.');
    }
}
