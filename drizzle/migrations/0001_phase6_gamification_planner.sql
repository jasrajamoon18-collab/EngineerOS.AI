-- Gamification
CREATE TABLE public.badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL DEFAULT 'award',
  criteria_kind text NOT NULL,
  threshold integer NOT NULL DEFAULT 1,
  xp_reward integer NOT NULL DEFAULT 50,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.badges TO authenticated;
GRANT ALL ON public.badges TO service_role;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Badges readable by signed-in users" ON public.badges FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage badges" ON public.badges FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.user_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_slug text NOT NULL,
  awarded_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, badge_slug)
);
GRANT SELECT, INSERT, DELETE ON public.user_badges TO authenticated;
GRANT ALL ON public.user_badges TO service_role;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own badges readable" ON public.user_badges FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Own badges insertable" ON public.user_badges FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Leaderboard opt-in
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS leaderboard_opt_in boolean NOT NULL DEFAULT false;

CREATE OR REPLACE FUNCTION public.leaderboard_rows(_limit integer DEFAULT 20)
RETURNS TABLE (display_name text, xp integer, streak_count integer, badge_count bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(NULLIF(p.full_name, ''), 'Anonymous student') AS display_name,
         p.xp,
         p.streak_count,
         (SELECT count(*) FROM public.user_badges ub WHERE ub.user_id = p.id) AS badge_count
  FROM public.profiles p
  WHERE p.leaderboard_opt_in = true
  ORDER BY p.xp DESC, p.streak_count DESC
  LIMIT LEAST(GREATEST(COALESCE(_limit, 20), 1), 100)
$$;
REVOKE ALL ON FUNCTION public.leaderboard_rows(integer) FROM public;
GRANT EXECUTE ON FUNCTION public.leaderboard_rows(integer) TO authenticated;

-- Study planner
CREATE TABLE public.study_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start date NOT NULL,
  focus text NOT NULL,
  summary text NOT NULL DEFAULT '',
  source text NOT NULL DEFAULT 'ai',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.study_plans TO authenticated;
GRANT ALL ON public.study_plans TO service_role;
ALTER TABLE public.study_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own study plans" ON public.study_plans FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER study_plans_updated_at BEFORE UPDATE ON public.study_plans FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.study_plan_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id uuid NOT NULL REFERENCES public.study_plans(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day_index integer NOT NULL DEFAULT 0,
  title text NOT NULL,
  detail text NOT NULL DEFAULT '',
  est_minutes integer NOT NULL DEFAULT 45,
  is_done boolean NOT NULL DEFAULT false,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.study_plan_items TO authenticated;
GRANT ALL ON public.study_plan_items TO service_role;
ALTER TABLE public.study_plan_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own study plan items" ON public.study_plan_items FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER study_plan_items_updated_at BEFORE UPDATE ON public.study_plan_items FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX study_plan_items_plan_idx ON public.study_plan_items (plan_id, day_index, order_index);
