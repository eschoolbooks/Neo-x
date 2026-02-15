/**
 * TypeScript types for Supabase database schema
 * Generated based on supabase-schema.sql
 */

export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            student_profiles: {
                Row: {
                    id: string
                    user_id: string
                    full_name: string
                    grade_level: string | null
                    board: string | null
                    target_exams: string[] | null
                    preferences: Json
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    full_name: string
                    grade_level?: string | null
                    board?: string | null
                    target_exams?: string[] | null
                    preferences?: Json
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    full_name?: string
                    grade_level?: string | null
                    board?: string | null
                    target_exams?: string[] | null
                    preferences?: Json
                    created_at?: string
                    updated_at?: string
                }
            }
            question_papers: {
                Row: {
                    id: string
                    user_id: string
                    title: string
                    exam_type: string
                    subject: string
                    year: number
                    board: string | null
                    file_url: string
                    file_size: number
                    processed: boolean
                    processing_status: string
                    extracted_text: string | null
                    extracted_questions: Json
                    metadata: Json
                    error_message: string | null
                    created_at: string
                    uploaded_by: string | null
                }
                Insert: {
                    id?: string
                    user_id: string
                    title: string
                    exam_type: string
                    subject: string
                    year: number
                    board?: string | null
                    file_url: string
                    file_size: number
                    processed?: boolean
                    processing_status?: string
                    extracted_text?: string | null
                    extracted_questions?: Json
                    metadata?: Json
                    error_message?: string | null
                    created_at?: string
                    uploaded_by?: string | null
                }
                Update: {
                    id?: string
                    user_id?: string
                    title?: string
                    exam_type?: string
                    subject?: string
                    year?: number
                    board?: string | null
                    file_url?: string
                    file_size?: number
                    processed?: boolean
                    processing_status?: string
                    extracted_text?: string | null
                    extracted_questions?: Json
                    metadata?: Json
                    error_message?: string | null
                    created_at?: string
                    uploaded_by?: string | null
                }
            }
            predictions: {
                Row: {
                    id: string
                    user_id: string
                    exam_type: string
                    subject: string
                    target_exam_date: string | null
                    question_paper_ids: string[]
                    predicted_topics: Json
                    predicted_questions: Json
                    study_recommendations: Json
                    total_confidence_score: number | null
                    processing_time_seconds: number | null
                    model_version: string
                    metadata: Json
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    exam_type: string
                    subject: string
                    target_exam_date?: string | null
                    question_paper_ids: string[]
                    predicted_topics?: Json
                    predicted_questions?: Json
                    study_recommendations?: Json
                    total_confidence_score?: number | null
                    processing_time_seconds?: number | null
                    model_version?: string
                    metadata?: Json
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    exam_type?: string
                    subject?: string
                    target_exam_date?: string | null
                    question_paper_ids?: string[]
                    predicted_topics?: Json
                    predicted_questions?: Json
                    study_recommendations?: Json
                    total_confidence_score?: number | null
                    processing_time_seconds?: number | null
                    model_version?: string
                    metadata?: Json
                    created_at?: string
                }
            }
            study_sessions: {
                Row: {
                    id: string
                    user_id: string
                    prediction_id: string | null
                    topic: string
                    subject: string | null
                    duration_minutes: number
                    notes: string | null
                    completed: boolean
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    prediction_id?: string | null
                    topic: string
                    subject?: string | null
                    duration_minutes: number
                    notes?: string | null
                    completed?: boolean
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    prediction_id?: string | null
                    topic?: string
                    subject?: string | null
                    duration_minutes?: number
                    notes?: string | null
                    completed?: boolean
                    created_at?: string
                }
            }
            feedback: {
                Row: {
                    id: string
                    user_id: string | null
                    type: 'bug' | 'feature' | 'general' | 'prediction_accuracy'
                    rating: number | null
                    message: string
                    prediction_id: string | null
                    status: 'open' | 'reviewed' | 'resolved' | 'closed'
                    admin_notes: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id?: string | null
                    type: 'bug' | 'feature' | 'general' | 'prediction_accuracy'
                    rating?: number | null
                    message: string
                    prediction_id?: string | null
                    status?: 'open' | 'reviewed' | 'resolved' | 'closed'
                    admin_notes?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string | null
                    type?: 'bug' | 'feature' | 'general' | 'prediction_accuracy'
                    rating?: number | null
                    message?: string
                    prediction_id?: string | null
                    status?: 'open' | 'reviewed' | 'resolved' | 'closed'
                    admin_notes?: string | null
                    created_at?: string
                }
            }
            analytics_events: {
                Row: {
                    id: string
                    user_id: string | null
                    event_type: string
                    event_data: Json
                    session_id: string | null
                    ip_address: string | null
                    user_agent: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id?: string | null
                    event_type: string
                    event_data?: Json
                    session_id?: string | null
                    ip_address?: string | null
                    user_agent?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string | null
                    event_type?: string
                    event_data?: Json
                    session_id?: string | null
                    ip_address?: string | null
                    user_agent?: string | null
                    created_at?: string
                }
            }
            study_plans: {
                Row: {
                    id: string
                    user_id: string
                    prediction_id: string
                    title: string
                    exam_date: string | null
                    daily_schedule: Json
                    progress: number
                    is_active: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    prediction_id: string
                    title: string
                    exam_date?: string | null
                    daily_schedule?: Json
                    progress?: number
                    is_active?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    prediction_id?: string
                    title?: string
                    exam_date?: string | null
                    daily_schedule?: Json
                    progress?: number
                    is_active?: boolean
                    created_at?: string
                    updated_at?: string
                }
            }
            shared_predictions: {
                Row: {
                    id: string
                    prediction_id: string
                    shared_by: string
                    share_code: string
                    is_public: boolean
                    view_count: number
                    expires_at: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    prediction_id: string
                    shared_by: string
                    share_code: string
                    is_public?: boolean
                    view_count?: number
                    expires_at?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    prediction_id?: string
                    shared_by?: string
                    share_code?: string
                    is_public?: boolean
                    view_count?: number
                    expires_at?: string | null
                    created_at?: string
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
    }
}
