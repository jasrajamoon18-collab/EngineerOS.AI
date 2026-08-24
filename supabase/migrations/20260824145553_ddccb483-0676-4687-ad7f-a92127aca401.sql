-- ============ CONTENT CATALOGUES ============
CREATE TABLE public.code_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'python',
  level TEXT NOT NULL DEFAULT 'beginner',
  prompt TEXT NOT NULL,
  starter_code TEXT NOT NULL DEFAULT '',
  hint TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.code_challenges TO anon, authenticated;
GRANT ALL ON public.code_challenges TO service_role;
ALTER TABLE public.code_challenges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "code_challenges_public_read" ON public.code_challenges FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.sql_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  level TEXT NOT NULL DEFAULT 'beginner',
  scenario TEXT NOT NULL,
  schema_sql TEXT NOT NULL,
  prompt TEXT NOT NULL,
  expected_result TEXT NOT NULL,
  solution_sql TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.sql_exercises TO anon, authenticated;
GRANT ALL ON public.sql_exercises TO service_role;
ALTER TABLE public.sql_exercises ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sql_exercises_public_read" ON public.sql_exercises FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.project_ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  domain TEXT NOT NULL DEFAULT 'software',
  level TEXT NOT NULL DEFAULT 'beginner',
  skills TEXT[] NOT NULL DEFAULT '{}',
  suggested_milestones TEXT[] NOT NULL DEFAULT '{}',
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.project_ideas TO anon, authenticated;
GRANT ALL ON public.project_ideas TO service_role;
ALTER TABLE public.project_ideas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "project_ideas_public_read" ON public.project_ideas FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.git_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'basics',
  level TEXT NOT NULL DEFAULT 'beginner',
  summary TEXT NOT NULL,
  commands JSONB NOT NULL DEFAULT '[]'::jsonb,
  practice TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.git_topics TO anon, authenticated;
GRANT ALL ON public.git_topics TO service_role;
ALTER TABLE public.git_topics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "git_topics_public_read" ON public.git_topics FOR SELECT TO anon, authenticated USING (true);

-- ============ USER CONTENT ============
CREATE TABLE public.code_snippets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  challenge_id UUID REFERENCES public.code_challenges ON DELETE SET NULL,
  title TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'python',
  code TEXT NOT NULL DEFAULT '',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.code_snippets TO authenticated;
GRANT ALL ON public.code_snippets TO service_role;
ALTER TABLE public.code_snippets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "code_snippets_own" ON public.code_snippets FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.sql_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES public.sql_exercises ON DELETE CASCADE,
  query_text TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'attempted',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, exercise_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sql_attempts TO authenticated;
GRANT ALL ON public.sql_attempts TO service_role;
ALTER TABLE public.sql_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sql_attempts_own" ON public.sql_attempts FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.portfolio_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users ON DELETE CASCADE,
  handle TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL DEFAULT '',
  headline TEXT NOT NULL DEFAULT '',
  bio TEXT NOT NULL DEFAULT '',
  github_url TEXT,
  linkedin_url TEXT,
  website_url TEXT,
  skills TEXT[] NOT NULL DEFAULT '{}',
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.portfolio_profiles TO authenticated;
GRANT SELECT ON public.portfolio_profiles TO anon;
GRANT ALL ON public.portfolio_profiles TO service_role;
ALTER TABLE public.portfolio_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "portfolio_profiles_own" ON public.portfolio_profiles FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "portfolio_profiles_public_read" ON public.portfolio_profiles FOR SELECT TO anon, authenticated
  USING (is_public = true);

CREATE TABLE public.user_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  idea_id UUID REFERENCES public.project_ideas ON DELETE SET NULL,
  title TEXT NOT NULL,
  summary TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'planning',
  repo_url TEXT,
  live_url TEXT,
  tech_stack TEXT[] NOT NULL DEFAULT '{}',
  show_in_portfolio BOOLEAN NOT NULL DEFAULT true,
  started_on DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_projects TO authenticated;
GRANT SELECT ON public.user_projects TO anon;
GRANT ALL ON public.user_projects TO service_role;
ALTER TABLE public.user_projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_projects_own" ON public.user_projects FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_projects_public_read" ON public.user_projects FOR SELECT TO anon, authenticated
  USING (
    show_in_portfolio = true
    AND EXISTS (
      SELECT 1 FROM public.portfolio_profiles p
      WHERE p.user_id = user_projects.user_id AND p.is_public = true
    )
  );

CREATE TABLE public.project_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.user_projects ON DELETE CASCADE,
  title TEXT NOT NULL,
  is_done BOOLEAN NOT NULL DEFAULT false,
  due_date DATE,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_milestones TO authenticated;
GRANT ALL ON public.project_milestones TO service_role;
ALTER TABLE public.project_milestones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "project_milestones_own" ON public.project_milestones FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.git_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES public.git_topics ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'todo',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, topic_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.git_progress TO authenticated;
GRANT ALL ON public.git_progress TO service_role;
ALTER TABLE public.git_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "git_progress_own" ON public.git_progress FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.resumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'My resume',
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.resumes TO authenticated;
GRANT ALL ON public.resumes TO service_role;
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "resumes_own" ON public.resumes FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.resume_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  resume_id UUID REFERENCES public.resumes ON DELETE SET NULL,
  job_title TEXT NOT NULL DEFAULT '',
  job_description TEXT NOT NULL DEFAULT '',
  score INTEGER NOT NULL DEFAULT 0,
  results JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.resume_analyses TO authenticated;
GRANT ALL ON public.resume_analyses TO service_role;
ALTER TABLE public.resume_analyses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "resume_analyses_own" ON public.resume_analyses FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============ updated_at triggers ============
CREATE TRIGGER trg_code_challenges_updated BEFORE UPDATE ON public.code_challenges FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_sql_exercises_updated BEFORE UPDATE ON public.sql_exercises FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_project_ideas_updated BEFORE UPDATE ON public.project_ideas FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_git_topics_updated BEFORE UPDATE ON public.git_topics FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_code_snippets_updated BEFORE UPDATE ON public.code_snippets FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_sql_attempts_updated BEFORE UPDATE ON public.sql_attempts FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_portfolio_profiles_updated BEFORE UPDATE ON public.portfolio_profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_user_projects_updated BEFORE UPDATE ON public.user_projects FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_project_milestones_updated BEFORE UPDATE ON public.project_milestones FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_git_progress_updated BEFORE UPDATE ON public.git_progress FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_resumes_updated BEFORE UPDATE ON public.resumes FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_resume_analyses_updated BEFORE UPDATE ON public.resume_analyses FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ SEED CONTENT ============
INSERT INTO public.code_challenges (slug, title, language, level, prompt, starter_code, hint, order_index) VALUES
('reverse-string','Reverse a string','python','beginner','Write a function that returns the reverse of a string without using built-in reverse helpers.','def reverse_string(s: str) -> str:\n    # your code here\n    pass','Walk the string from the last index down to 0 and build the result.',1),
('fizzbuzz','FizzBuzz','python','beginner','Print numbers 1..n, replacing multiples of 3 with Fizz, 5 with Buzz and both with FizzBuzz.','def fizzbuzz(n: int) -> list[str]:\n    pass','Check divisibility by 15 first.',2),
('two-sum','Two Sum','python','intermediate','Given an array of integers and a target, return the indices of the two numbers that add up to the target.','def two_sum(nums: list[int], target: int) -> tuple[int, int]:\n    pass','Store each seen value in a dictionary mapping value -> index.',3),
('matrix-transpose','Matrix transpose','python','intermediate','Return the transpose of an m x n matrix without using numpy.','def transpose(matrix):\n    pass','Result row i is built from column i of the input.',4),
('bank-account-oop','Bank account class','java','intermediate','Model a BankAccount class with deposit, withdraw and overdraft protection. Keep the balance private.','public class BankAccount {\n    // your code here\n}','Throw an exception instead of allowing a negative balance.',5),
('linked-list-cycle','Detect a cycle in a linked list','cpp','advanced','Detect whether a singly linked list contains a cycle using O(1) extra space.','bool hasCycle(ListNode *head) {\n    // your code here\n}','Two pointers: one moves one step, the other two.',6);

INSERT INTO public.sql_exercises (slug, title, level, scenario, schema_sql, prompt, expected_result, solution_sql, order_index) VALUES
('select-basics','Select and filter','beginner','A small students table for a college department.','CREATE TABLE students (\n  id INT PRIMARY KEY,\n  name TEXT,\n  branch TEXT,\n  cgpa NUMERIC\n);','List the name and cgpa of every student in the CSE branch with a cgpa above 8, highest first.','name   | cgpa\n-------+------\nAsha   | 9.10\nRahul  | 8.40','SELECT name, cgpa\nFROM students\nWHERE branch = ''CSE'' AND cgpa > 8\nORDER BY cgpa DESC;',1),
('group-by','Aggregate per branch','beginner','Same students table.','CREATE TABLE students (\n  id INT PRIMARY KEY,\n  name TEXT,\n  branch TEXT,\n  cgpa NUMERIC\n);','Show each branch with its student count and average cgpa rounded to 2 decimals.','branch | students | avg_cgpa\n-------+----------+---------\nCSE    | 12       | 8.21','SELECT branch, COUNT(*) AS students, ROUND(AVG(cgpa), 2) AS avg_cgpa\nFROM students\nGROUP BY branch;',2),
('joins','Join students and projects','intermediate','Students own zero or more projects.','CREATE TABLE students (id INT PRIMARY KEY, name TEXT);\nCREATE TABLE projects (id INT PRIMARY KEY, student_id INT, title TEXT, status TEXT);','List every student together with how many shipped projects they have, including students with none.','name  | shipped\n------+--------\nAsha  | 2\nRahul | 0','SELECT s.name, COUNT(p.id) FILTER (WHERE p.status = ''shipped'') AS shipped\nFROM students s\nLEFT JOIN projects p ON p.student_id = s.id\nGROUP BY s.name;',3),
('subquery','Above average students','intermediate','Same students table.','CREATE TABLE students (id INT PRIMARY KEY, name TEXT, branch TEXT, cgpa NUMERIC);','Find students whose cgpa is above the average cgpa of their own branch.','name | branch | cgpa','SELECT name, branch, cgpa\nFROM students s\nWHERE cgpa > (SELECT AVG(cgpa) FROM students x WHERE x.branch = s.branch);',4),
('window-functions','Rank within a branch','advanced','Same students table.','CREATE TABLE students (id INT PRIMARY KEY, name TEXT, branch TEXT, cgpa NUMERIC);','Rank students by cgpa within each branch and return only the top 3 per branch.','branch | name | cgpa | rnk','SELECT branch, name, cgpa, rnk FROM (\n  SELECT branch, name, cgpa,\n         DENSE_RANK() OVER (PARTITION BY branch ORDER BY cgpa DESC) AS rnk\n  FROM students\n) t\nWHERE rnk <= 3;',5);

INSERT INTO public.project_ideas (slug, title, summary, domain, level, skills, suggested_milestones, order_index) VALUES
('attendance-tracker','Class attendance tracker','A web app where a class representative marks attendance and students see their own percentage and shortage warnings.','software','beginner',ARRAY['React','REST APIs','SQL'],ARRAY['Design the data model','Build attendance marking UI','Add per-student percentage view','Deploy and write the README'],1),
('iot-weather-station','IoT weather station','A microcontroller reads temperature and humidity, pushes readings to a dashboard with historical charts.','electronics','intermediate',ARRAY['Embedded C','MQTT','Charting'],ARRAY['Wire and test the sensor','Publish readings over MQTT','Store readings in a database','Build the dashboard'],2),
('resume-parser','Resume keyword parser','A tool that extracts skills and sections from a plain-text resume and reports coverage against a role.','software','intermediate',ARRAY['Python','Regex','Text processing'],ARRAY['Define the skill taxonomy','Write the section splitter','Score coverage','Add a CLI or web UI'],3),
('structural-load-calc','Structural load calculator','A calculator for beam load and deflection under standard load cases with exportable reports.','mechanical','intermediate',ARRAY['Engineering mechanics','Numerical methods','UI design'],ARRAY['Collect the formula set','Validate against textbook cases','Build the input form','Add PDF export'],4),
('campus-lost-found','Campus lost & found','A moderated board where students post lost items with photos and claim flows.','software','beginner',ARRAY['Auth','Storage','CRUD'],ARRAY['Auth and roles','Post creation with images','Claim and resolve flow','Moderation view'],5),
('smart-energy-monitor','Smart energy monitor','Measure appliance-level power draw and surface the biggest consumers of a hostel room.','electrical','advanced',ARRAY['Sensors','Signal processing','Data viz'],ARRAY['Calibrate the current sensor','Log data reliably','Detect appliance signatures','Publish findings'],6);

INSERT INTO public.git_topics (slug, title, category, level, summary, commands, practice, order_index) VALUES
('git-setup','Set up Git identity','basics','beginner','Configure your name, email and default branch before your first commit so your history is attributable.','[{"cmd":"git config --global user.name \"Your Name\"","desc":"Set the author name on every commit."},{"cmd":"git config --global user.email you@example.com","desc":"Use the same email as your GitHub account."},{"cmd":"git config --global init.defaultBranch main","desc":"New repositories start on main."}]','Run git config --list and confirm your identity is set.',1),
('git-first-commit','Init, stage, commit','basics','beginner','The core loop: change files, stage the ones you mean, describe the change in a commit message.','[{"cmd":"git init","desc":"Create a repository in the current folder."},{"cmd":"git status","desc":"See what changed and what is staged."},{"cmd":"git add .","desc":"Stage all changes in the working tree."},{"cmd":"git commit -m \"Add attendance model\"","desc":"Record the staged snapshot."}]','Create a folder, make three commits and read them back with git log --oneline.',2),
('git-branching','Branching and merging','branching','beginner','Branches let you build a feature without breaking main. Merging brings the work back.','[{"cmd":"git switch -c feature/login","desc":"Create and move to a new branch."},{"cmd":"git switch main","desc":"Go back to main."},{"cmd":"git merge feature/login","desc":"Merge the feature branch into the current one."},{"cmd":"git branch -d feature/login","desc":"Delete the merged branch."}]','Build one small feature on a branch and merge it back cleanly.',3),
('git-remote','Remotes and GitHub','github','beginner','A remote is a copy of your repository hosted elsewhere. Push sends commits up, pull brings them down.','[{"cmd":"git remote add origin https://github.com/you/repo.git","desc":"Link your local repo to GitHub."},{"cmd":"git push -u origin main","desc":"Push main and track it."},{"cmd":"git pull --rebase","desc":"Bring remote commits in without a merge bubble."}]','Create an empty GitHub repository and push an existing local project to it.',4),
('git-pull-requests','Pull requests and reviews','github','intermediate','Pull requests are how teams review code. A good PR is small, described and tested.','[{"cmd":"git push -u origin feature/login","desc":"Publish your branch so a PR can be opened."},{"cmd":"gh pr create --fill","desc":"Open a pull request from the CLI (GitHub CLI required)."}]','Open a PR on your own repository and review your own diff line by line before merging.',5),
('git-undo','Undoing mistakes safely','recovery','intermediate','Most Git mistakes are recoverable. Know which command rewrites history and which does not.','[{"cmd":"git restore --staged file.txt","desc":"Unstage without losing changes."},{"cmd":"git revert <sha>","desc":"Create a new commit that undoes an old one (safe on shared branches)."},{"cmd":"git reset --hard <sha>","desc":"Rewrite local history - destructive, never on shared branches."},{"cmd":"git reflog","desc":"Find commits you thought you lost."}]','Deliberately break a branch in a scratch repo and recover it with reflog.',6),
('git-conflicts','Resolving merge conflicts','branching','intermediate','A conflict means Git cannot choose between two edits to the same lines. You decide, then commit.','[{"cmd":"git status","desc":"List conflicted files."},{"cmd":"git diff","desc":"Inspect conflict markers."},{"cmd":"git add file.txt","desc":"Mark the conflict resolved."},{"cmd":"git merge --abort","desc":"Back out of the merge entirely."}]','Create a conflict on purpose between two branches and resolve it by hand.',7),
('git-readme','READMEs that get you hired','github','beginner','Recruiters read the README before the code. Show the problem, the stack, a screenshot and how to run it.','[{"cmd":"git add README.md","desc":"Commit the README alongside the first working version."}]','Rewrite one existing project README with: what, why, stack, screenshots, run steps.',8);