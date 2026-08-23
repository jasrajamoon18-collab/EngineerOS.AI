-- ENUMS
CREATE TYPE public.app_role AS ENUM ('admin','moderator','student');
CREATE TYPE public.track_kind AS ENUM ('programming','linux','dsa','core','career');
CREATE TYPE public.difficulty AS ENUM ('beginner','intermediate','advanced');
CREATE TYPE public.progress_status AS ENUM ('not_started','in_progress','completed');
CREATE TYPE public.dsa_status AS ENUM ('todo','attempted','solved');
CREATE TYPE public.profile_visibility AS ENUM ('private','students','public');

-- UPDATED AT HELPER
CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS TRIGGER
LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- ROLES
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL DEFAULT 'student',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE POLICY "own roles readable" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "admins read roles" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));

-- PROFILES
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  avatar_url text,
  branch_slug text,
  academic_year smallint,
  college text,
  career_goal text,
  bio text,
  xp integer NOT NULL DEFAULT 0,
  streak_count integer NOT NULL DEFAULT 0,
  last_active_date date,
  onboarding_completed boolean NOT NULL DEFAULT false,
  visibility public.profile_visibility NOT NULL DEFAULT 'private',
  show_progress boolean NOT NULL DEFAULT false,
  show_branch boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile all" ON public.profiles FOR ALL TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY "public profiles readable" ON public.profiles FOR SELECT TO authenticated USING (visibility IN ('students','public'));
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NULLIF(NEW.raw_user_meta_data->>'full_name',''))
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'student')
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- BRANCHES
CREATE TABLE public.branches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  icon text,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.branches TO anon, authenticated;
GRANT ALL ON public.branches TO service_role;
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "branches readable" ON public.branches FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admins write branches" ON public.branches FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- COURSES
CREATE TABLE public.courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  summary text,
  description text,
  track public.track_kind NOT NULL DEFAULT 'core',
  level public.difficulty NOT NULL DEFAULT 'beginner',
  branch_slug text,
  tags text[] NOT NULL DEFAULT '{}',
  estimated_hours integer NOT NULL DEFAULT 6,
  accent text NOT NULL DEFAULT 'primary',
  order_index integer NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.courses TO anon, authenticated;
GRANT ALL ON public.courses TO service_role;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "courses readable" ON public.courses FOR SELECT TO anon, authenticated USING (is_published OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins write courses" ON public.courses FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER courses_updated_at BEFORE UPDATE ON public.courses FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- MODULES
CREATE TABLE public.modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title text NOT NULL,
  summary text,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.modules TO anon, authenticated;
GRANT ALL ON public.modules TO service_role;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "modules readable" ON public.modules FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admins write modules" ON public.modules FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- LESSONS
CREATE TABLE public.lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id uuid NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  slug text NOT NULL,
  title text NOT NULL,
  content_md text NOT NULL DEFAULT '',
  kind text NOT NULL DEFAULT 'reading',
  est_minutes integer NOT NULL DEFAULT 10,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (module_id, slug)
);
GRANT SELECT ON public.lessons TO anon, authenticated;
GRANT ALL ON public.lessons TO service_role;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lessons readable" ON public.lessons FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admins write lessons" ON public.lessons FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ENROLLMENTS
CREATE TABLE public.enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, course_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.enrollments TO authenticated;
GRANT ALL ON public.enrollments TO service_role;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own enrollments" ON public.enrollments FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- LESSON PROGRESS
CREATE TABLE public.lesson_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id uuid NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  status public.progress_status NOT NULL DEFAULT 'in_progress',
  completed_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, lesson_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lesson_progress TO authenticated;
GRANT ALL ON public.lesson_progress TO service_role;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own lesson progress" ON public.lesson_progress FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE TRIGGER lesson_progress_updated_at BEFORE UPDATE ON public.lesson_progress FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- DSA PROBLEMS
CREATE TABLE public.dsa_problems (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  topic text NOT NULL,
  level public.difficulty NOT NULL DEFAULT 'beginner',
  statement text NOT NULL DEFAULT '',
  hint text,
  pattern text,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.dsa_problems TO anon, authenticated;
GRANT ALL ON public.dsa_problems TO service_role;
ALTER TABLE public.dsa_problems ENABLE ROW LEVEL SECURITY;
CREATE POLICY "problems readable" ON public.dsa_problems FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admins write problems" ON public.dsa_problems FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.dsa_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  problem_id uuid NOT NULL REFERENCES public.dsa_problems(id) ON DELETE CASCADE,
  status public.dsa_status NOT NULL DEFAULT 'todo',
  notes text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, problem_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.dsa_progress TO authenticated;
GRANT ALL ON public.dsa_progress TO service_role;
ALTER TABLE public.dsa_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own dsa progress" ON public.dsa_progress FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE TRIGGER dsa_progress_updated_at BEFORE UPDATE ON public.dsa_progress FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- DAILY TASKS
CREATE TABLE public.daily_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  description text,
  track public.track_kind NOT NULL DEFAULT 'core',
  xp integer NOT NULL DEFAULT 10,
  est_minutes integer NOT NULL DEFAULT 15,
  is_active boolean NOT NULL DEFAULT true,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.daily_tasks TO anon, authenticated;
GRANT ALL ON public.daily_tasks TO service_role;
ALTER TABLE public.daily_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tasks readable" ON public.daily_tasks FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admins write tasks" ON public.daily_tasks FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.task_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id uuid NOT NULL REFERENCES public.daily_tasks(id) ON DELETE CASCADE,
  completed_on date NOT NULL DEFAULT current_date,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, task_id, completed_on)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.task_completions TO authenticated;
GRANT ALL ON public.task_completions TO service_role;
ALTER TABLE public.task_completions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own task completions" ON public.task_completions FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- ROADMAPS
CREATE TABLE public.roadmaps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  description text,
  branch_slug text,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.roadmaps TO anon, authenticated;
GRANT ALL ON public.roadmaps TO service_role;
ALTER TABLE public.roadmaps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "roadmaps readable" ON public.roadmaps FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admins write roadmaps" ON public.roadmaps FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.roadmap_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  roadmap_id uuid NOT NULL REFERENCES public.roadmaps(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  course_slug text,
  order_index integer NOT NULL DEFAULT 0
);
GRANT SELECT ON public.roadmap_steps TO anon, authenticated;
GRANT ALL ON public.roadmap_steps TO service_role;
ALTER TABLE public.roadmap_steps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "roadmap steps readable" ON public.roadmap_steps FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admins write roadmap steps" ON public.roadmap_steps FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- AI MENTOR
CREATE TABLE public.mentor_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT 'New conversation',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mentor_conversations TO authenticated;
GRANT ALL ON public.mentor_conversations TO service_role;
ALTER TABLE public.mentor_conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own conversations" ON public.mentor_conversations FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE TRIGGER mentor_conversations_updated_at BEFORE UPDATE ON public.mentor_conversations FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.mentor_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.mentor_conversations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mentor_messages TO authenticated;
GRANT ALL ON public.mentor_messages TO service_role;
ALTER TABLE public.mentor_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own messages" ON public.mentor_messages FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- SEED: branches
INSERT INTO public.branches (slug,name,description,icon,order_index) VALUES
('cse','Computer Science','Software, systems, data and everything that computes.','cpu',1),
('ece','Electronics & Communication','Circuits, signals, embedded systems and communication.','radio',2),
('eee','Electrical & Electronics','Power systems, machines, control and energy.','zap',3),
('mech','Mechanical','Design, thermal, manufacturing and mechanics.','cog',4),
('civil','Civil','Structures, geotech, transportation and construction.','building-2',5),
('aids','AI & Data Science','Machine learning, data engineering and applied AI.','brain',6);

-- SEED: courses
INSERT INTO public.courses (slug,title,summary,description,track,level,branch_slug,tags,estimated_hours,order_index) VALUES
('c-programming','C Programming Foundations','Master memory, pointers and the language every engineer meets first.','C is the language behind operating systems, embedded devices and interview questions. This course builds fundamentals from syntax to pointers and memory.','programming','beginner',NULL,ARRAY['c','fundamentals'],10,1),
('python-essentials','Python Essentials','From syntax to scripting real automation.','Python is the fastest route from idea to working program. Learn the syntax, data structures, and how to structure small projects.','programming','beginner',NULL,ARRAY['python','scripting'],12,2),
('java-oop','Java & Object-Oriented Design','Classes, objects and clean design thinking.','Learn Java syntax alongside the object-oriented concepts interviewers and product teams actually test.','programming','intermediate',NULL,ARRAY['java','oop'],14,3),
('linux-basics','Linux Fundamentals','Live comfortably in the terminal.','The filesystem, permissions, processes and the commands that make you dangerous on any server.','linux','beginner',NULL,ARRAY['linux','cli'],8,1),
('linux-shell','Shell Scripting & Automation','Turn repeated work into scripts.','Bash scripting, pipes, cron and the automation habits of a real engineer.','linux','intermediate',NULL,ARRAY['bash','automation'],9,2),
('dsa-foundations','DSA Foundations','Arrays, strings, complexity and the thinking behind them.','Learn to reason about time and space, then apply it to the core data structures every interview starts with.','dsa','beginner',NULL,ARRAY['dsa','interview'],16,1),
('engineering-math','Engineering Mathematics Core','The math that shows up everywhere.','Linear algebra, calculus and probability framed for engineers who need to use it, not just pass it.','core','beginner',NULL,ARRAY['math'],12,1),
('career-readiness','Career Readiness Basics','Resume, portfolio and interview fundamentals.','Build a resume that survives screening, a portfolio that proves skill, and interview habits that hold under pressure.','career','beginner',NULL,ARRAY['career'],6,1);

-- SEED: modules + lessons
DO $$
DECLARE c RECORD; m_id uuid;
BEGIN
  FOR c IN SELECT id, slug, title FROM public.courses LOOP
    INSERT INTO public.modules (course_id,title,summary,order_index)
    VALUES (c.id,'Getting Oriented','Why this matters and how the track is structured.',1) RETURNING id INTO m_id;
    INSERT INTO public.lessons (module_id,slug,title,content_md,est_minutes,order_index) VALUES
    (m_id,'why-this-track','Why this track matters',
     '## Why this track matters' || E'\n\n' || 'This module frames the skill you are about to build, where it appears in real engineering work, and how it connects to interviews and projects.' || E'\n\n' || '### What you will do' || E'\n\n' || '- Understand the shape of the whole track before diving in' || E'\n' || '- Set a realistic weekly pace' || E'\n' || '- Identify the one outcome you want from this course' || E'\n\n' || '> Learning without a target is just consumption. Pick your target now.',8,1),
    (m_id,'how-to-practice','How to practice effectively',
     '## Practice beats reading' || E'\n\n' || 'Every lesson in EngineerOS is paired with an action. Reading a concept moves you 10%; writing it out and breaking it moves you the rest of the way.' || E'\n\n' || '### The loop' || E'\n\n' || '1. Read the concept once, quickly' || E'\n' || '2. Try it before you feel ready' || E'\n' || '3. Break it deliberately and read the error' || E'\n' || '4. Explain it in one sentence in your own words' || E'\n\n' || 'Mark this lesson complete once you have set up your practice environment.',10,2);

    INSERT INTO public.modules (course_id,title,summary,order_index)
    VALUES (c.id,'Core Concepts','The essential ideas of ' || c.title || '.',2) RETURNING id INTO m_id;
    INSERT INTO public.lessons (module_id,slug,title,content_md,est_minutes,order_index) VALUES
    (m_id,'core-concept-1','Core building blocks',
     '## Core building blocks' || E'\n\n' || 'Every subject has a small set of primitives that everything else is built from. Learn those deeply and the rest becomes composition.' || E'\n\n' || '### Focus areas' || E'\n\n' || '- The vocabulary you will see in every later lesson' || E'\n' || '- The mental model that keeps details organised' || E'\n' || '- The mistakes beginners make and why' || E'\n\n' || 'Take notes in your own words as you go.',15,1),
    (m_id,'core-concept-2','Putting it together',
     '## Putting it together' || E'\n\n' || 'Now combine the primitives into something that does real work. The goal is not elegance yet — the goal is a working thing you understand end to end.' || E'\n\n' || '### Exercise' || E'\n\n' || 'Build the smallest possible version of something useful using only what you have learned so far. Then extend it by one feature.' || E'\n\n' || '> If you cannot explain how your solution works line by line, you are not done.',20,2);

    INSERT INTO public.modules (course_id,title,summary,order_index)
    VALUES (c.id,'Apply It','Turn knowledge into a portfolio artifact.',3) RETURNING id INTO m_id;
    INSERT INTO public.lessons (module_id,slug,title,content_md,est_minutes,order_index) VALUES
    (m_id,'mini-project','Mini project brief',
     '## Mini project' || E'\n\n' || 'Ship something small and complete. A finished small project beats an abandoned ambitious one every time.' || E'\n\n' || '### Requirements' || E'\n\n' || '- Solves one clearly stated problem' || E'\n' || '- Runs without manual patching' || E'\n' || '- Has a short README explaining the why' || E'\n\n' || '### Stretch' || E'\n\n' || 'Add one test, or one performance improvement you can measure.',30,1),
    (m_id,'review-reflect','Review and reflect',
     '## Review and reflect' || E'\n\n' || 'Close the loop. Write down what surprised you, what still feels shaky, and what you would do differently.' || E'\n\n' || 'Your AI Mentor can help turn this reflection into your next focus area.',10,2);
  END LOOP;
END $$;

-- SEED: dsa problems
INSERT INTO public.dsa_problems (slug,title,topic,level,statement,hint,pattern,order_index) VALUES
('two-sum','Two Sum','Arrays','beginner','Given an array of integers and a target, return the indices of the two numbers that add up to the target.','What if you remembered every number you have already seen?','Hash map lookup',1),
('reverse-string','Reverse a String','Strings','beginner','Reverse a string in place using constant extra space.','Two pointers walking toward each other.','Two pointers',2),
('max-subarray','Maximum Subarray','Arrays','intermediate','Find the contiguous subarray with the largest sum.','Would you ever keep a running sum that is negative?','Kadane',3),
('valid-parentheses','Valid Parentheses','Stacks','beginner','Determine whether a string of brackets is correctly balanced.','Last opened, first closed.','Stack',4),
('binary-search','Binary Search','Searching','beginner','Find a target in a sorted array in logarithmic time.','Halve the search space every step. Mind the mid overflow.','Binary search',5),
('linked-list-cycle','Linked List Cycle','Linked Lists','intermediate','Detect whether a linked list contains a cycle.','Two runners at different speeds must meet on a loop.','Fast and slow pointers',6),
('merge-intervals','Merge Intervals','Intervals','intermediate','Merge all overlapping intervals.','Sorting first makes overlap a local question.','Sort and sweep',7),
('bfs-grid','Shortest Path in a Grid','Graphs','intermediate','Find the shortest path from start to end in a grid with obstacles.','Unweighted shortest path has one canonical answer.','BFS',8),
('lru-cache','LRU Cache','Design','advanced','Design a cache with O(1) get and put that evicts the least recently used entry.','A map for lookup plus a list for ordering.','Hash map + doubly linked list',9),
('word-ladder','Word Ladder','Graphs','advanced','Find the shortest transformation sequence between two words.','Words are nodes; one-letter differences are edges.','BFS on implicit graph',10);

-- SEED: daily tasks
INSERT INTO public.daily_tasks (slug,title,description,track,xp,est_minutes,order_index) VALUES
('daily-dsa','Solve one DSA problem','Pick an unsolved problem from the DSA area and work it end to end.','dsa',30,45,1),
('daily-lesson','Complete one lesson','Move one lesson forward in your active course.','core',20,20,2),
('daily-terminal','Ten minutes in the terminal','Practice Linux commands until they are muscle memory.','linux',15,10,3),
('daily-code','Write code for 30 minutes','Any project, any language. Consistency compounds.','programming',25,30,4),
('daily-reflect','Log what you learned','One paragraph. What clicked, what did not.','core',10,5,5),
('daily-career','Improve one resume line','Small, repeated edits build a strong resume.','career',15,10,6);

-- SEED: roadmap
DO $$
DECLARE r_id uuid;
BEGIN
  INSERT INTO public.roadmaps (slug,title,description,branch_slug,order_index)
  VALUES ('software-engineer','Software Engineer Roadmap','A staged path from first program to interview-ready engineer.','cse',1)
  RETURNING id INTO r_id;
  INSERT INTO public.roadmap_steps (roadmap_id,title,description,course_slug,order_index) VALUES
  (r_id,'Learn one language well','Pick Python or C and go deep rather than wide.','python-essentials',1),
  (r_id,'Get comfortable in Linux','The terminal is where engineering work actually happens.','linux-basics',2),
  (r_id,'Build DSA foundations','Complexity thinking plus the core data structures.','dsa-foundations',3),
  (r_id,'Automate something real','Shell scripting turns knowledge into leverage.','linux-shell',4),
  (r_id,'Design with objects','Structure larger programs cleanly.','java-oop',5),
  (r_id,'Prepare for the hunt','Resume, portfolio and interview practice.','career-readiness',6);
END $$;