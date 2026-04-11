
UPDATE storage.buckets SET public = true WHERE id = 'audio-recordings';

-- Allow public read access to audio recordings
CREATE POLICY "Public read access for audio recordings"
ON storage.objects
FOR SELECT
USING (bucket_id = 'audio-recordings');
