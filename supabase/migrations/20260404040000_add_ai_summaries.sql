CREATE TABLE public.ai_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  summary JSONB NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('model', 'local_fallback')),
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ai_summaries_user_id
ON public.ai_summaries(user_id);

ALTER TABLE public.ai_summaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own ai summaries"
ON public.ai_summaries
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own ai summaries"
ON public.ai_summaries
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ai summaries"
ON public.ai_summaries
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ai summaries"
ON public.ai_summaries
FOR DELETE
USING (auth.uid() = user_id);
