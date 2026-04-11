
-- Create recordings bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('recordings', 'recordings', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anonymous uploads
CREATE POLICY "Allow anonymous uploads to recordings"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'recordings');

-- Allow public reads
CREATE POLICY "Allow public reads from recordings"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'recordings');
