
-- Allow anonymous uploads to audio-recordings bucket
CREATE POLICY "Allow public uploads to audio-recordings"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'audio-recordings');

-- Allow public reads from audio-recordings bucket
CREATE POLICY "Allow public reads from audio-recordings"
ON storage.objects
FOR SELECT
USING (bucket_id = 'audio-recordings');

-- Allow anonymous session inserts (for MVP demo without auth)
CREATE POLICY "Allow anonymous session inserts"
ON public.sessions
FOR INSERT
WITH CHECK (user_id IS NULL);

-- Allow public reads of sessions with null user_id
CREATE POLICY "Allow public reads of anonymous sessions"
ON public.sessions
FOR SELECT
USING (user_id IS NULL);
