
CREATE TABLE public.student_session_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id TEXT NOT NULL,
  student_name TEXT NOT NULL,
  group_id TEXT NOT NULL,
  group_name TEXT NOT NULL,
  session_id TEXT NOT NULL,
  session_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  session_topic TEXT NOT NULL DEFAULT 'General Discussion',
  speaking_turns INTEGER NOT NULL DEFAULT 0,
  participation_pct INTEGER NOT NULL DEFAULT 0,
  tone_signal TEXT NOT NULL DEFAULT 'neutral',
  flagged BOOLEAN NOT NULL DEFAULT false,
  flag_description TEXT,
  age_range TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.student_session_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read student_session_records"
ON public.student_session_records FOR SELECT
TO public USING (true);

CREATE POLICY "Allow public insert student_session_records"
ON public.student_session_records FOR INSERT
TO public WITH CHECK (true);

CREATE POLICY "Allow public update student_session_records"
ON public.student_session_records FOR UPDATE
TO public USING (true) WITH CHECK (true);

CREATE POLICY "Allow public delete student_session_records"
ON public.student_session_records FOR DELETE
TO public USING (true);

CREATE INDEX idx_student_session_records_student ON public.student_session_records(student_id);
CREATE INDEX idx_student_session_records_session ON public.student_session_records(session_id);
