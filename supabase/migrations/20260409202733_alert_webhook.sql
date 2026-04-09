-- Enable pg_net if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Create function to invoke our newly deployed Edge Function
CREATE OR REPLACE FUNCTION "public"."invoke_notify_alert"()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM extensions.http_post(
    'https://prjmnengccfuptkctcml.supabase.co/functions/v1/notify-alert',
    '{"Content-Type":"application/json", "Authorization":"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InByam1uZW5nY2NmdXB0a2N0Y21sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2NzA5NTEsImV4cCI6MjA4NzI0Njk1MX0.W9cyq1QdiZmz6fvkYQKvAgZkwDatd-7P8iQpKJkKsc8"}',
    '{"record": ' || row_to_json(NEW)::text || '}'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on the alerts table
DROP TRIGGER IF EXISTS "notify_alert_webhook" ON "public"."alerts";
CREATE TRIGGER "notify_alert_webhook"
  AFTER INSERT
  ON "public"."alerts"
  FOR EACH ROW
  EXECUTE FUNCTION "public"."invoke_notify_alert"();
