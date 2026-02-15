import { createClient } from './client';
import type { Database } from './database.types';

type StudentProfile = Database['public']['Tables']['student_profiles']['Row'];
type QuestionPaper = Database['public']['Tables']['question_papers']['Row'];
type Prediction = Database['public']['Tables']['predictions']['Row'];
type StudySession = Database['public']['Tables']['study_sessions']['Row'];
type Feedback = Database['public']['Tables']['feedback']['Row'];
type StudyPlan = Database['public']['Tables']['study_plans']['Row'];

/**
 * Student Profile Operations
 */

export async function getStudentProfile(userId: string): Promise<StudentProfile | null> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('student_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

    if (error) {
        console.error('Error fetching student profile:', error);
        return null;
    }

    return data;
}

export async function updateStudentProfile(
    userId: string,
    updates: Partial<StudentProfile>
) {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('student_profiles')
        .update(updates)
        .eq('user_id', userId)
        .select()
        .single();

    if (error) {
        throw new Error(error.message);
    }

    return data;
}

/**
 * Question Paper Operations
 */

export async function getQuestionPapers(userId: string): Promise<QuestionPaper[]> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('question_papers')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching question papers:', error);
        return [];
    }

    return data || [];
}

export async function getQuestionPaper(id: string): Promise<QuestionPaper | null> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('question_papers')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        console.error('Error fetching question paper:', error);
        return null;
    }

    return data;
}

export async function createQuestionPaper(
    questionPaper: Database['public']['Tables']['question_papers']['Insert']
): Promise<QuestionPaper> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('question_papers')
        .insert(questionPaper)
        .select()
        .single();

    if (error) {
        throw new Error(error.message);
    }

    return data;
}

export async function updateQuestionPaper(
    id: string,
    updates: Partial<QuestionPaper>
) {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('question_papers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        throw new Error(error.message);
    }

    return data;
}

export async function deleteQuestionPaper(id: string) {
    const supabase = createClient();

    const { error } = await supabase
        .from('question_papers')
        .delete()
        .eq('id', id);

    if (error) {
        throw new Error(error.message);
    }
}

/**
 * Prediction Operations
 */

export async function getPredictions(userId: string): Promise<Prediction[]> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('predictions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching predictions:', error);
        return [];
    }

    return data || [];
}

export async function getPrediction(id: string): Promise<Prediction | null> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('predictions')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        console.error('Error fetching prediction:', error);
        return null;
    }

    return data;
}

export async function createPrediction(
    prediction: Database['public']['Tables']['predictions']['Insert']
): Promise<Prediction> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('predictions')
        .insert(prediction)
        .select()
        .single();

    if (error) {
        throw new Error(error.message);
    }

    return data;
}

/**
 * Study Session Operations
 */

export async function getStudySessions(
    userId: string,
    predictionId?: string
): Promise<StudySession[]> {
    const supabase = createClient();

    let query = supabase
        .from('study_sessions')
        .select('*')
        .eq('user_id', userId);

    if (predictionId) {
        query = query.eq('prediction_id', predictionId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching study sessions:', error);
        return [];
    }

    return data || [];
}

export async function createStudySession(
    session: Database['public']['Tables']['study_sessions']['Insert']
): Promise<StudySession> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('study_sessions')
        .insert(session)
        .select()
        .single();

    if (error) {
        throw new Error(error.message);
    }

    return data;
}

export async function updateStudySession(
    id: string,
    updates: Partial<StudySession>
) {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('study_sessions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        throw new Error(error.message);
    }

    return data;
}

/**
 * Feedback Operations
 */

export async function createFeedback(
    feedback: Database['public']['Tables']['feedback']['Insert']
): Promise<Feedback> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('feedback')
        .insert(feedback)
        .select()
        .single();

    if (error) {
        throw new Error(error.message);
    }

    return data;
}

/**
 * Analytics Operations
 */

export async function trackEvent(
    eventType: string,
    eventData: Record<string, any> = {},
    userId?: string
) {
    const supabase = createClient();

    const { error } = await supabase
        .from('analytics_events')
        .insert({
            user_id: userId || null,
            event_type: eventType,
            event_data: eventData,
        });

    if (error) {
        console.error('Error tracking event:', error);
    }
}

/**
 * Study Plan Operations
 */

export async function getStudyPlans(userId: string): Promise<StudyPlan[]> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('study_plans')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching study plans:', error);
        return [];
    }

    return data || [];
}

export async function createStudyPlan(
    plan: Database['public']['Tables']['study_plans']['Insert']
): Promise<StudyPlan> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('study_plans')
        .insert(plan)
        .select()
        .single();

    if (error) {
        throw new Error(error.message);
    }

    return data;
}

export async function updateStudyPlan(
    id: string,
    updates: Partial<StudyPlan>
) {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('study_plans')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        throw new Error(error.message);
    }

    return data;
}
