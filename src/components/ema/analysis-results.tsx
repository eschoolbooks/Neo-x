'use client';

import { BarChart, BookOpen, BrainCircuit, RefreshCw } from 'lucide-react';
import type { AnalysisResult } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface AnalysisResultsProps {
  result: AnalysisResult;
  onReset: () => void;
}

export function AnalysisResults({ result, onReset }: AnalysisResultsProps) {
  const { predictedTopics, confidenceScores, studyRecommendations } = result;

  return (
    <div className="w-full max-w-4xl z-10 space-y-6">
      <Card className="shadow-lg bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center gap-3">
            <BrainCircuit className="w-6 h-6 text-primary" />
            <CardTitle className="text-2xl font-bold">
              Analysis Complete
            </CardTitle>
          </div>
          <CardDescription>
            Here are the predicted topics and study recommendations from EMA.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-lg bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <BarChart className="w-5 h-5 text-accent" />
              <CardTitle>Predicted Topics</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {predictedTopics.map((topic, index) => (
                <li key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Badge variant="secondary" className="font-medium">
                      {topic}
                    </Badge>
                    {confidenceScores?.[index] && (
                       <span className="text-sm font-semibold text-foreground">
                        {Math.round(confidenceScores[index] * 100)}%
                      </span>
                    )}
                  </div>
                  {confidenceScores?.[index] && (
                    <Progress
                      value={confidenceScores[index] * 100}
                      className="h-2"
                      indicatorClassName="bg-accent"
                    />
                  )}
                </li>
              ))}
            </ul>
            {predictedTopics.length === 0 && (
              <p className="text-muted-foreground text-center py-4">
                No specific topics could be predicted from the provided documents.
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-lg bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <BookOpen className="w-5 h-5 text-primary" />
              <CardTitle>Study Recommendations</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm dark:prose-invert max-w-none text-foreground text-opacity-90 whitespace-pre-wrap">
              {studyRecommendations}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="text-center">
        <Button onClick={onReset} size="lg">
          <RefreshCw className="mr-2 h-4 w-4" />
          Analyze Another Exam
        </Button>
      </div>
    </div>
  );
}
