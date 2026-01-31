-- Create candidate_test_history table for storing practice test results
CREATE TABLE public.candidate_test_history (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    session_id uuid,
    test_type text NOT NULL CHECK (test_type IN ('mock', 'learning', 'free')),
    score integer NOT NULL,
    total_questions integer NOT NULL,
    time_taken_seconds integer,
    category_scores jsonb DEFAULT '{}'::jsonb,
    completed_at timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.candidate_test_history ENABLE ROW LEVEL SECURITY;

-- RLS: Users can only see their own records
CREATE POLICY "Users can view own history"
ON public.candidate_test_history
FOR SELECT
USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

-- RLS: Users can insert their own records
CREATE POLICY "Users can insert own history"
ON public.candidate_test_history
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- RLS: Users can update their own records (for edge cases)
CREATE POLICY "Users can update own history"
ON public.candidate_test_history
FOR UPDATE
USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_candidate_test_history_user_id ON public.candidate_test_history(user_id);
CREATE INDEX idx_candidate_test_history_completed_at ON public.candidate_test_history(completed_at);