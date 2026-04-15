-- Add tables to the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE users;
ALTER PUBLICATION supabase_realtime ADD TABLE vitals_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE treks;
ALTER PUBLICATION supabase_realtime ADD TABLE trek_participants;
