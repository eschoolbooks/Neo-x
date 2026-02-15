-- Neo-X Question Prediction System - Supabase Schema
-- This schema supports an AI-powered question prediction system for students

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

--------------------------------------------------------------------------------
-- TABLES
--------------------------------------------------------------------------------

-- Student Profiles (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS student_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    grade_level TEXT, -- e.g., "12th Grade", "Plus 2", "Undergraduate"
    board TEXT, -- e.g., "CBSE", "State Board", "ICSE", "University"
    target_exams TEXT[], -- Array of target exams like ["NEET", "JEE", "Plus 2"]
    preferences JSONB DEFAULT '{}', -- User preferences (theme, notifications, etc.)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Question Papers uploaded by users
CREATE TABLE IF NOT EXISTS question_papers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    exam_type TEXT NOT NULL, -- e.g., "NEET", "JEE Main", "Plus 2", "UPSC"
    subject TEXT NOT NULL, -- e.g., "Physics", "Chemistry", "Mathematics"
    year INTEGER NOT NULL,
    board TEXT, -- e.g., "CBSE", "State Board", "ICSE"
    file_url TEXT NOT NULL, -- Supabase Storage URL
    file_size BIGINT NOT NULL, -- in bytes
    processed BOOLEAN DEFAULT FALSE,
    processing_status TEXT DEFAULT 'pending', -- "pending", "processing", "completed", "failed"
    extracted_text TEXT, -- OCR/extracted content from PDF
    extracted_questions JSONB DEFAULT '[]', -- Array of extracted questions
    metadata JSONB DEFAULT '{}', -- Additional metadata (upload source, device, etc.)
    error_message TEXT, -- Error message if processing failed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- AI Prediction Results
CREATE TABLE IF NOT EXISTS predictions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    exam_type TEXT NOT NULL,
    subject TEXT NOT NULL,
    target_exam_date DATE,
    question_paper_ids UUID[] NOT NULL, -- Array of question paper IDs used for this prediction
    predicted_topics JSONB NOT NULL DEFAULT '[]', -- Array of {topic, subject, confidence, justification, priority}
    predicted_questions JSONB NOT NULL DEFAULT '[]', -- Array of {question, answer, topic, confidence, difficulty}
    study_recommendations JSONB NOT NULL DEFAULT '[]', -- Array of {title, description, priority, estimatedHours}
    total_confidence_score NUMERIC(5,2), -- Overall prediction confidence (0-100)
    processing_time_seconds NUMERIC(8,2),
    model_version TEXT DEFAULT 'gemini-2.5-flash', -- AI model used
    metadata JSONB DEFAULT '{}', -- Additional data
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Study Sessions (track student study time)
CREATE TABLE IF NOT EXISTS study_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    prediction_id UUID REFERENCES predictions(id) ON DELETE SET NULL,
    topic TEXT NOT NULL,
    subject TEXT,
    duration_minutes INTEGER NOT NULL,
    notes TEXT,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Feedback
CREATE TABLE IF NOT EXISTS feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    type TEXT NOT NULL CHECK (type IN ('bug', 'feature', 'general', 'prediction_accuracy')),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    message TEXT NOT NULL,
    prediction_id UUID REFERENCES predictions(id) ON DELETE SET NULL, -- Link to specific prediction if relevant
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'reviewed', 'resolved', 'closed')),
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics Events (usage tracking)
CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL, -- e.g., "prediction_created", "paper_uploaded", "page_view"
    event_data JSONB DEFAULT '{}',
    session_id TEXT,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Saved Study Plans
CREATE TABLE IF NOT EXISTS study_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    prediction_id UUID REFERENCES predictions(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    exam_date DATE,
    daily_schedule JSONB NOT NULL DEFAULT '[]', -- Array of {day, topics, timeBlocks}
    progress NUMERIC(5,2) DEFAULT 0, -- Percentage of plan completed
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Shared Predictions (for collaboration / community features - future)
CREATE TABLE IF NOT EXISTS shared_predictions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prediction_id UUID REFERENCES predictions(id) ON DELETE CASCADE NOT NULL,
    shared_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    share_code TEXT UNIQUE NOT NULL, -- Unique code for sharing link
    is_public BOOLEAN DEFAULT FALSE,
    view_count INTEGER DEFAULT 0,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

--------------------------------------------------------------------------------
-- INDEXES for Performance
--------------------------------------------------------------------------------

-- Student Profiles
CREATE INDEX IF NOT EXISTS idx_student_profiles_user_id ON student_profiles(user_id);

-- Question Papers
CREATE INDEX IF NOT EXISTS idx_question_papers_user_id ON question_papers(user_id);
CREATE INDEX IF NOT EXISTS idx_question_papers_exam_type ON question_papers(exam_type);
CREATE INDEX IF NOT EXISTS idx_question_papers_subject ON question_papers(subject);
CREATE INDEX IF NOT EXISTS idx_question_papers_year ON question_papers(year);
CREATE INDEX IF NOT EXISTS idx_question_papers_processed ON question_papers(processed);
CREATE INDEX IF NOT EXISTS idx_question_papers_created_at ON question_papers(created_at DESC);

-- Predictions
CREATE INDEX IF NOT EXISTS idx_predictions_user_id ON predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_predictions_exam_type ON predictions(exam_type);
CREATE INDEX IF NOT EXISTS idx_predictions_created_at ON predictions(created_at DESC);

-- Study Sessions
CREATE INDEX IF NOT EXISTS idx_study_sessions_user_id ON study_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_prediction_id ON study_sessions(prediction_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_created_at ON study_sessions(created_at DESC);

-- Analytics Events
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at DESC);

-- Study Plans
CREATE INDEX IF NOT EXISTS idx_study_plans_user_id ON study_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_study_plans_prediction_id ON study_plans(prediction_id);

--------------------------------------------------------------------------------
-- ROW LEVEL SECURITY POLICIES
--------------------------------------------------------------------------------

-- Enable RLS on all tables
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_predictions ENABLE ROW LEVEL SECURITY;

-- Student Profiles Policies
CREATE POLICY "Users can view their own profile" ON student_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON student_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON student_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Question Papers Policies
CREATE POLICY "Users can view their own question papers" ON question_papers
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own question papers" ON question_papers
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own question papers" ON question_papers
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own question papers" ON question_papers
    FOR DELETE USING (auth.uid() = user_id);

-- Predictions Policies
CREATE POLICY "Users can view their own predictions" ON predictions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own predictions" ON predictions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own predictions" ON predictions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own predictions" ON predictions
    FOR DELETE USING (auth.uid() = user_id);

-- Study Sessions Policies
CREATE POLICY "Users can view their own study sessions" ON study_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own study sessions" ON study_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own study sessions" ON study_sessions
    FOR UPDATE USING (auth.uid() = user_id);

-- Feedback Policies
CREATE POLICY "Users can view their own feedback" ON feedback
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert feedback" ON feedback
    FOR INSERT WITH CHECK (true); -- Anyone can submit feedback

-- Analytics Events Policies
CREATE POLICY "Users can insert analytics events" ON analytics_events
    FOR INSERT WITH CHECK (true); -- Allow analytics for all users

-- Study Plans Policies
CREATE POLICY "Users can view their own study plans" ON study_plans
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own study plans" ON study_plans
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own study plans" ON study_plans
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own study plans" ON study_plans
    FOR DELETE USING (auth.uid() = user_id);

-- Shared Predictions Policies
CREATE POLICY "Anyone can view public shared predictions" ON shared_predictions
    FOR SELECT USING (is_public = true OR auth.uid() = shared_by);

CREATE POLICY "Users can create shared predictions for their predictions" ON shared_predictions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM predictions 
            WHERE predictions.id = prediction_id 
            AND predictions.user_id = auth.uid()
        )
    );

--------------------------------------------------------------------------------
-- FUNCTIONS AND TRIGGERS
--------------------------------------------------------------------------------

-- Function to update 'updated_at' timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for student_profiles
CREATE TRIGGER update_student_profiles_updated_at
    BEFORE UPDATE ON student_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for study_plans
CREATE TRIGGER update_study_plans_updated_at
    BEFORE UPDATE ON study_plans
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to auto-create student profile on user signup
CREATE OR REPLACE FUNCTION create_student_profile_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO student_profiles (user_id, full_name)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'Student')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on new user
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION create_student_profile_for_new_user();

--------------------------------------------------------------------------------
-- STORAGE BUCKETS
--------------------------------------------------------------------------------

-- Create storage bucket for question papers (PDF files)
-- Note: This needs to be run via Supabase Dashboard or API, not SQL
-- Bucket name: 'question-papers'
-- Public access: false (users can only access their own files)
-- File size limit: 15MB
-- Allowed MIME types: application/pdf

--------------------------------------------------------------------------------
-- SAMPLE DATA (for testing - remove in production)
--------------------------------------------------------------------------------

-- Uncomment below to insert sample exam types for reference
-- INSERT INTO analytics_events (event_type, event_data) VALUES
-- ('sample_exam_types', '{"types": ["NEET", "JEE Main", "JEE Advanced", "Plus 2", "CBSE 12th", "State Board", "UPSC", "SSC", "Bank PO", "CAT", "GATE"]}'::jsonb);
