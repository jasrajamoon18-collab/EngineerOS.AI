REVOKE EXECUTE ON FUNCTION public.leaderboard_rows(integer) FROM anon;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.leaderboard_rows(integer) TO authenticated;