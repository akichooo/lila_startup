CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.groups (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  grade TEXT,
  student_count INTEGER NOT NULL DEFAULT 5,
  topic TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.students (
  id TEXT PRIMARY KEY,
  group_id TEXT REFERENCES public.groups(id) ON DELETE SET NULL,
  display_name TEXT NOT NULL,
  age_range TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.sessions
  ADD COLUMN IF NOT EXISTS audio_url TEXT,
  ADD COLUMN IF NOT EXISTS analysis_status TEXT NOT NULL DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS speaker_map JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS processed_at TIMESTAMP WITH TIME ZONE;

CREATE TABLE IF NOT EXISTS public.session_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  group_id TEXT REFERENCES public.groups(id) ON DELETE SET NULL,
  student_id TEXT REFERENCES public.students(id) ON DELETE SET NULL,
  student_name TEXT,
  speaker_label TEXT NOT NULL,
  display_name TEXT NOT NULL,
  speaking_turns INTEGER NOT NULL DEFAULT 0,
  total_turn_duration_sec NUMERIC NOT NULL DEFAULT 0,
  avg_turn_duration_sec NUMERIC NOT NULL DEFAULT 0,
  interruptions INTEGER NOT NULL DEFAULT 0,
  response_latency_sec NUMERIC,
  words_per_turn NUMERIC NOT NULL DEFAULT 0,
  questions_asked INTEGER NOT NULL DEFAULT 0,
  tone_register TEXT NOT NULL DEFAULT 'neutral' CHECK (tone_register IN ('positive', 'neutral', 'uncertain')),
  topic_relevance NUMERIC NOT NULL DEFAULT 0,
  participation_pct NUMERIC NOT NULL DEFAULT 0,
  observation_flags TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  raw_metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT session_metrics_session_speaker_unique UNIQUE (session_id, speaker_label)
);

CREATE TABLE IF NOT EXISTS public.teacher_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE,
  student_id TEXT REFERENCES public.students(id) ON DELETE SET NULL,
  note_text TEXT NOT NULL,
  created_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.follow_ups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE,
  group_id TEXT REFERENCES public.groups(id) ON DELETE SET NULL,
  student_id TEXT REFERENCES public.students(id) ON DELETE SET NULL,
  student_name TEXT,
  speaker_label TEXT,
  title TEXT NOT NULL,
  body TEXT,
  flag TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'done')),
  due_date DATE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_students_group ON public.students(group_id);
CREATE INDEX IF NOT EXISTS idx_sessions_group ON public.sessions(group_id);
CREATE INDEX IF NOT EXISTS idx_session_metrics_session ON public.session_metrics(session_id);
CREATE INDEX IF NOT EXISTS idx_session_metrics_student ON public.session_metrics(student_id);
CREATE INDEX IF NOT EXISTS idx_session_metrics_group ON public.session_metrics(group_id);
CREATE INDEX IF NOT EXISTS idx_teacher_notes_session ON public.teacher_notes(session_id);
CREATE INDEX IF NOT EXISTS idx_follow_ups_status ON public.follow_ups(status);
CREATE INDEX IF NOT EXISTS idx_follow_ups_session ON public.follow_ups(session_id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_groups_updated_at'
  ) THEN
    CREATE TRIGGER update_groups_updated_at
      BEFORE UPDATE ON public.groups
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_students_updated_at'
  ) THEN
    CREATE TRIGGER update_students_updated_at
      BEFORE UPDATE ON public.students
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_session_metrics_updated_at'
  ) THEN
    CREATE TRIGGER update_session_metrics_updated_at
      BEFORE UPDATE ON public.session_metrics
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_teacher_notes_updated_at'
  ) THEN
    CREATE TRIGGER update_teacher_notes_updated_at
      BEFORE UPDATE ON public.teacher_notes
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_follow_ups_updated_at'
  ) THEN
    CREATE TRIGGER update_follow_ups_updated_at
      BEFORE UPDATE ON public.follow_ups
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follow_ups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public updates of anonymous sessions" ON public.sessions;
CREATE POLICY "Allow public updates of anonymous sessions"
ON public.sessions FOR UPDATE
TO public
USING (user_id IS NULL)
WITH CHECK (user_id IS NULL);

DROP POLICY IF EXISTS "Allow public read groups" ON public.groups;
DROP POLICY IF EXISTS "Allow public insert groups" ON public.groups;
DROP POLICY IF EXISTS "Allow public update groups" ON public.groups;
CREATE POLICY "Allow public read groups" ON public.groups FOR SELECT TO public USING (true);
CREATE POLICY "Allow public insert groups" ON public.groups FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow public update groups" ON public.groups FOR UPDATE TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read students" ON public.students;
DROP POLICY IF EXISTS "Allow public insert students" ON public.students;
DROP POLICY IF EXISTS "Allow public update students" ON public.students;
CREATE POLICY "Allow public read students" ON public.students FOR SELECT TO public USING (true);
CREATE POLICY "Allow public insert students" ON public.students FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow public update students" ON public.students FOR UPDATE TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read session_metrics" ON public.session_metrics;
DROP POLICY IF EXISTS "Allow public insert session_metrics" ON public.session_metrics;
DROP POLICY IF EXISTS "Allow public update session_metrics" ON public.session_metrics;
CREATE POLICY "Allow public read session_metrics" ON public.session_metrics FOR SELECT TO public USING (true);
CREATE POLICY "Allow public insert session_metrics" ON public.session_metrics FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow public update session_metrics" ON public.session_metrics FOR UPDATE TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read teacher_notes" ON public.teacher_notes;
DROP POLICY IF EXISTS "Allow public insert teacher_notes" ON public.teacher_notes;
DROP POLICY IF EXISTS "Allow public update teacher_notes" ON public.teacher_notes;
CREATE POLICY "Allow public read teacher_notes" ON public.teacher_notes FOR SELECT TO public USING (true);
CREATE POLICY "Allow public insert teacher_notes" ON public.teacher_notes FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow public update teacher_notes" ON public.teacher_notes FOR UPDATE TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read follow_ups" ON public.follow_ups;
DROP POLICY IF EXISTS "Allow public insert follow_ups" ON public.follow_ups;
DROP POLICY IF EXISTS "Allow public update follow_ups" ON public.follow_ups;
CREATE POLICY "Allow public read follow_ups" ON public.follow_ups FOR SELECT TO public USING (true);
CREATE POLICY "Allow public insert follow_ups" ON public.follow_ups FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow public update follow_ups" ON public.follow_ups FOR UPDATE TO public USING (true) WITH CHECK (true);
