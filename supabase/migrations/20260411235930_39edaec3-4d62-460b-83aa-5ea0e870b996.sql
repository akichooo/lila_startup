CREATE TABLE public.session_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  audio_url text,
  report_text text NOT NULL DEFAULT '',
  report_json jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.session_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read session_reports" ON public.session_reports FOR SELECT USING (true);
CREATE POLICY "Allow public insert session_reports" ON public.session_reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update session_reports" ON public.session_reports FOR UPDATE USING (true) WITH CHECK (true);