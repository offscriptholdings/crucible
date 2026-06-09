-- MTC-321: enable Realtime for cos_session_log so postgres_changes subscriptions fire.
-- Without this, supabase.channel().on('postgres_changes', ...) receives no INSERT events.
ALTER PUBLICATION supabase_realtime ADD TABLE cos_session_log;
