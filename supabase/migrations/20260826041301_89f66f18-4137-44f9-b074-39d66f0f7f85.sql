-- Phase 3: LinkedIn Career Center, Communication Academy, Interview Academy,
-- Skill Gap Analyzer, Career Roadmaps

-- ============ LinkedIn Career Center ============
CREATE TABLE public.linkedin_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  title text NOT NULL,
  guidance text NOT NULL,
  checklist jsonb NOT NULL DEFAULT '[]'::jsonb,
  example_weak text,
  example_strong text,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.linkedin_sections TO anon, authenticated;
GRANT ALL ON public.linkedin_sections TO service_role;
ALTER TABLE public.linkedin_sections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "linkedin_sections readable" ON public.linkedin_sections FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.linkedin_drafts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  section_key text NOT NULL,
  draft_text text NOT NULL DEFAULT '',
  self_rating integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, section_key)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.linkedin_drafts TO authenticated;
GRANT ALL ON public.linkedin_drafts TO service_role;
ALTER TABLE public.linkedin_drafts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own linkedin drafts" ON public.linkedin_drafts FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER linkedin_drafts_updated_at BEFORE UPDATE ON public.linkedin_drafts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ Communication Academy ============
CREATE TABLE public.communication_prompts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  title text NOT NULL,
  prompt text NOT NULL,
  guidance text NOT NULL,
  minutes integer NOT NULL DEFAULT 5,
  min_words integer NOT NULL DEFAULT 80,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.communication_prompts TO anon, authenticated;
GRANT ALL ON public.communication_prompts TO service_role;
ALTER TABLE public.communication_prompts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "communication_prompts readable" ON public.communication_prompts FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.communication_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  prompt_id uuid NOT NULL REFERENCES public.communication_prompts ON DELETE CASCADE,
  response_text text NOT NULL,
  word_count integer NOT NULL DEFAULT 0,
  feedback jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.communication_entries TO authenticated;
GRANT ALL ON public.communication_entries TO service_role;
ALTER TABLE public.communication_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own communication entries" ON public.communication_entries FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER communication_entries_updated_at BEFORE UPDATE ON public.communication_entries
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ Interview Academy ============
CREATE TABLE public.interview_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  track text NOT NULL,
  level text NOT NULL DEFAULT 'core',
  question text NOT NULL,
  context text,
  criteria jsonb NOT NULL DEFAULT '[]'::jsonb,
  keywords jsonb NOT NULL DEFAULT '[]'::jsonb,
  strong_answer_points jsonb NOT NULL DEFAULT '[]'::jsonb,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.interview_questions TO anon, authenticated;
GRANT ALL ON public.interview_questions TO service_role;
ALTER TABLE public.interview_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "interview_questions readable" ON public.interview_questions FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.interview_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES public.interview_questions ON DELETE CASCADE,
  answer_text text NOT NULL,
  checks jsonb NOT NULL DEFAULT '[]'::jsonb,
  self_rating integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.interview_answers TO authenticated;
GRANT ALL ON public.interview_answers TO service_role;
ALTER TABLE public.interview_answers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own interview answers" ON public.interview_answers FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER interview_answers_updated_at BEFORE UPDATE ON public.interview_answers
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ Skill Gap Analyzer ============
CREATE TABLE public.skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  category text NOT NULL,
  description text,
  order_index integer NOT NULL DEFAULT 0
);
GRANT SELECT ON public.skills TO anon, authenticated;
GRANT ALL ON public.skills TO service_role;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "skills readable" ON public.skills FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.career_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  description text NOT NULL,
  branch_slug text,
  order_index integer NOT NULL DEFAULT 0
);
GRANT SELECT ON public.career_roles TO anon, authenticated;
GRANT ALL ON public.career_roles TO service_role;
ALTER TABLE public.career_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "career_roles readable" ON public.career_roles FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.role_skill_targets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_slug text NOT NULL,
  skill_slug text NOT NULL,
  target_level integer NOT NULL DEFAULT 3,
  weight integer NOT NULL DEFAULT 1,
  UNIQUE (role_slug, skill_slug)
);
GRANT SELECT ON public.role_skill_targets TO anon, authenticated;
GRANT ALL ON public.role_skill_targets TO service_role;
ALTER TABLE public.role_skill_targets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "role_skill_targets readable" ON public.role_skill_targets FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.user_skill_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  skill_slug text NOT NULL,
  level integer NOT NULL DEFAULT 0,
  evidence text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, skill_slug)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_skill_ratings TO authenticated;
GRANT ALL ON public.user_skill_ratings TO service_role;
ALTER TABLE public.user_skill_ratings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own skill ratings" ON public.user_skill_ratings FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER user_skill_ratings_updated_at BEFORE UPDATE ON public.user_skill_ratings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ Career Roadmaps ============
CREATE TABLE public.career_tracks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  description text NOT NULL,
  career_goal text,
  branch_slug text,
  horizon text NOT NULL DEFAULT '12 weeks',
  order_index integer NOT NULL DEFAULT 0
);
GRANT SELECT ON public.career_tracks TO anon, authenticated;
GRANT ALL ON public.career_tracks TO service_role;
ALTER TABLE public.career_tracks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "career_tracks readable" ON public.career_tracks FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.career_track_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  track_slug text NOT NULL,
  phase text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  route text,
  order_index integer NOT NULL DEFAULT 0
);
GRANT SELECT ON public.career_track_steps TO anon, authenticated;
GRANT ALL ON public.career_track_steps TO service_role;
ALTER TABLE public.career_track_steps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "career_track_steps readable" ON public.career_track_steps FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.career_step_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  step_id uuid NOT NULL REFERENCES public.career_track_steps ON DELETE CASCADE,
  is_done boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, step_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.career_step_progress TO authenticated;
GRANT ALL ON public.career_step_progress TO service_role;
ALTER TABLE public.career_step_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own career step progress" ON public.career_step_progress FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER career_step_progress_updated_at BEFORE UPDATE ON public.career_step_progress
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ Seed content ============
INSERT INTO public.linkedin_sections (key, title, guidance, checklist, example_weak, example_strong, order_index) VALUES
('headline','Headline','120 characters that answer "what do you do and what are you aiming at". Lead with the role you want, then your strongest proof, then a domain.','["Names a target role, not just \"student\"","Mentions 2-3 concrete technologies","Readable without jargon","No emoji spam or buzzword stacking"]','B.Tech student | Passionate coder | Seeking opportunities','CSE undergrad building backend systems in Python & Postgres | 120+ DSA problems solved',1),
('about','About','A short first-person story: who you are, what you build, what you are learning, and what you want next. 3 short paragraphs beat one wall of text.','["Written in first person","Says what you have actually built","States the kind of role you want","Ends with how to contact you"]','Hardworking and dedicated fresher looking for a job in a reputed company.','I am a third-year CSE student who likes making messy data usable. Last semester I built a bus-tracking app used by 40 classmates ...',2),
('experience','Experience & projects','Every entry gets an action verb, the tech used, and an outcome. Internships, freelance work, club roles and serious projects all count.','["Each bullet starts with an action verb","Names the stack","Has a number or measurable outcome","No responsibilities-only bullets"]','Worked on a web development project using React.','Built a React + Supabase attendance tool that cut manual roll-call from 10 minutes to under 1 per class.',3),
('skills','Skills & endorsements','Pick a focused set. 10 relevant skills beat 40 vague ones — recruiters filter on the top three.','["Top 3 skills match your target role","No skill you cannot discuss for 3 minutes","Mix of language, tool and domain skills"]','MS Word, Teamwork, C, C++, Java, Python, HTML, Leadership','Python, PostgreSQL, REST API design, Git, Data structures',4),
('activity','Posting & activity','Consistent, useful posts beat a perfect profile nobody visits. Write what you learned this week — that is enough.','["A post idea drafted for this week","Comments on 3 posts in your field","No engagement-bait or fake milestones"]','Excited to share that I completed a course!!! #blessed #100daysofcode','What I got wrong about database indexes this week — and the 3-line fix that made my query 20x faster.',5);

INSERT INTO public.communication_prompts (category, title, prompt, guidance, minutes, min_words, order_index) VALUES
('Explain','Explain it to a non-engineer','Explain what an API is to a shopkeeper who has never used a computer.','Use one everyday analogy, avoid jargon, finish with one sentence of "why it matters".',5,80,1),
('Explain','Teach one concept','Pick a concept you learned this week and teach it in under 150 words.','Structure: what it is, why it exists, one example, one gotcha.',6,90,2),
('Interview','Tell me about yourself','Write your 90-second self-introduction for a campus interview.','Present -> past -> future. No life story; end with why this role.',5,110,3),
('Interview','Explain your best project','Describe your strongest project: problem, your role, decisions, outcome.','Say "I" for your work and "we" for the team. Include one number.',7,120,4),
('Writing','Cold outreach message','Write a 100-word message to an engineer whose work you admire, asking for guidance.','Specific reason for reaching out, one concrete question, easy to say yes to.',5,80,5),
('Writing','Status update email','Write a project status update to a professor: progress, blockers, next steps.','Three short sections, no apology padding, state exactly what you need.',5,80,6),
('Teamwork','Disagreeing well','A teammate wants to rewrite working code before the deadline. Write your reply.','Acknowledge, state the risk with evidence, propose an alternative and a decision point.',6,90,7),
('Teamwork','Owning a mistake','You broke the shared build and lost the team two hours. Write the message you send.','Facts, impact, fix, prevention. No excuses, no over-apologising.',5,80,8);

INSERT INTO public.interview_questions (track, level, question, context, criteria, keywords, strong_answer_points, order_index) VALUES
('hr','core','Tell me about yourself.','Almost always the opener. 90 seconds, ending on why you want this role.','["Follows present-past-future structure","Mentions concrete work, not adjectives","Ends by connecting to the role","Stays under ~200 words"]','["built","project","learned","role","team"]','["One line on who you are now","Two proof points from real work","What you want next and why here"]',1),
('hr','core','Why should we hire you over other candidates?','Tests self-awareness, not arrogance.','["Names 2-3 specific strengths","Backs each with evidence","Ties strengths to the job needs","Avoids generic hardworking claims"]','["because","example","built","result","team"]','["Strength + evidence pairs","Explicit link to the role requirements","Honest about what you are still learning"]',2),
('hr','core','Where do you see yourself in three years?','Checks direction and realism.','["Names a concrete role or skill level","Shows a path, not a wish","Mentions learning plan","No unrealistic title jumps"]','["role","learn","skills","ownership"]','["A believable next role","Skills you plan to deepen","Why this company helps that path"]',3),
('behavioural','core','Describe a time you failed and what you changed afterwards.','Behavioural questions are scored on structure — STAR.','["Sets Situation and Task briefly","Describes your Actions in first person","States a Result, ideally measurable","Names the lasting change in behaviour"]','["situation","i decided","result","learned","because"]','["A real failure, not a humblebrag","Your decisions, not the team''s","The specific habit you changed"]',4),
('behavioural','core','Tell me about a conflict inside your team.','Tests collaboration under pressure.','["Explains both viewpoints fairly","Describes what you personally did","States how it resolved","No blaming language"]','["we","i suggested","agreed","resolved","perspective"]','["Neutral framing of the disagreement","A concrete resolution mechanism","What you would do earlier next time"]',5),
('behavioural','stretch','Tell me about a time you had to learn something fast.','Tests learning strategy.','["Names the constraint or deadline","Explains the learning method used","Shows the applied outcome","Mentions how you verified understanding"]','["deadline","documentation","practised","shipped","verified"]','["Why it was urgent","How you sequenced the learning","Evidence it worked"]',6),
('technical','core','Explain the difference between an array and a linked list, and when you would choose each.','Fundamentals are still the most common technical opener.','["Explains memory layout","Compares access and insertion cost","Gives a concrete use case for each","Uses correct complexity terms"]','["contiguous","o(1)","o(n)","pointer","cache"]','["Random access vs sequential","Insertion/deletion trade-offs","A real scenario for each"]',7),
('technical','core','What happens when you type a URL into the browser and press enter?','A breadth question — interviewers watch how you structure the unknown.','["Mentions DNS resolution","Mentions TCP/TLS connection","Mentions request and response","Mentions rendering"]','["dns","tcp","tls","http","render"]','["An ordered pipeline","At least one caching layer","Where things commonly fail"]',8),
('technical','stretch','How would you design a URL shortener for a college project?','Light system design; scope honestly for the scale asked.','["Clarifies scale and requirements first","Describes the data model","Explains key generation","Mentions one trade-off"]','["hash","collision","database","index","cache"]','["Requirements before solution","ID generation strategy","Read-heavy access pattern handling"]',9),
('technical','core','Your query got slow after the table grew. How do you debug it?','Practical debugging beats memorised theory.','["Starts with measurement","Mentions the query plan","Mentions indexing","Avoids guess-first answers"]','["explain","index","plan","measure","query"]','["Reproduce and measure first","Read the execution plan","Fix the cause, then re-measure"]',10),
('branch-core','core','Explain a core concept from your branch to a first-year student.','Core-subject depth matters for both placements and higher studies.','["Definition in plain words","One worked example","Where it is used in practice","Names one common misconception"]','["example","because","used","concept"]','["Plain-language definition","A concrete example","A real application"]',11),
('branch-core','stretch','Which subject from your degree do you actually use, and how?','Tests reflection and honesty.','["Names a specific subject","Links it to real work you did","Honest about gaps","No pretending everything was useful"]','["subject","used","project","gap"]','["A specific subject and topic","Where it appeared in your work","What you would revise"]',12);

INSERT INTO public.skills (slug, name, category, description, order_index) VALUES
('programming-fundamentals','Programming fundamentals','Core','Syntax, control flow, functions, debugging in at least one language',1),
('data-structures','Data structures','Core','Arrays, strings, hashmaps, trees, graphs',2),
('algorithms','Algorithms & complexity','Core','Sorting, searching, recursion, Big-O reasoning',3),
('oop','Object-oriented design','Core','Classes, interfaces, composition, SOLID basics',4),
('databases','Databases & SQL','Core','Schema design, joins, indexes, transactions',5),
('operating-systems','Operating systems','Core','Processes, threads, memory, scheduling',6),
('networking','Computer networks','Core','TCP/IP, HTTP, DNS, latency',7),
('linux','Linux & shell','Tooling','Filesystem, permissions, pipes, scripting',8),
('git','Git & collaboration','Tooling','Branching, reviews, resolving conflicts',9),
('debugging','Debugging & testing','Tooling','Reading stack traces, writing tests, bisecting bugs',10),
('web-frontend','Frontend development','Applied','HTML, CSS, a component framework, accessibility',11),
('web-backend','Backend & APIs','Applied','REST design, auth, validation, error handling',12),
('system-design','System design basics','Applied','Caching, queues, scaling reads, trade-offs',13),
('cloud-deploy','Deployment & cloud','Applied','Environments, CI, hosting, secrets handling',14),
('data-analysis','Data analysis','Applied','Cleaning, aggregation, visualisation, basic statistics',15),
('embedded','Embedded & hardware interfacing','Applied','Microcontrollers, sensors, protocols',16),
('communication','Technical communication','Human','Explaining work in writing and speech',17),
('teamwork','Teamwork & ownership','Human','Splitting work, updates, follow-through',18),
('problem-framing','Problem framing','Human','Clarifying requirements before coding',19),
('interview-readiness','Interview readiness','Career','Structured answers, mock practice, question handling',20),
('portfolio-proof','Portfolio & proof of work','Career','Shipped projects, readable repos, a live resume',21);

INSERT INTO public.career_roles (slug, title, description, branch_slug, order_index) VALUES
('sde','Software engineer (product/service)','Builds and maintains software features end to end. The default campus-placement target for CS-adjacent branches.',NULL,1),
('backend','Backend / API engineer','Owns data models, APIs and the reliability of what runs on the server.',NULL,2),
('data-analyst','Data analyst','Turns raw data into decisions with SQL, spreadsheets and clear reporting.',NULL,3),
('embedded','Embedded systems engineer','Writes firmware and interfaces software with real hardware.',NULL,4),
('higher-studies','Higher studies (MS/M.Tech)','Research-and-fundamentals path: strong core subjects, projects and writing.',NULL,5);

INSERT INTO public.role_skill_targets (role_slug, skill_slug, target_level, weight) VALUES
('sde','programming-fundamentals',4,3),('sde','data-structures',4,3),('sde','algorithms',4,3),('sde','oop',3,2),('sde','databases',3,2),('sde','git',3,2),('sde','debugging',3,2),('sde','web-backend',3,1),('sde','system-design',2,1),('sde','communication',3,2),('sde','interview-readiness',4,3),('sde','portfolio-proof',3,2),
('backend','programming-fundamentals',4,3),('backend','databases',4,3),('backend','web-backend',4,3),('backend','operating-systems',3,2),('backend','networking',3,2),('backend','system-design',3,2),('backend','git',3,2),('backend','debugging',3,2),('backend','cloud-deploy',3,1),('backend','portfolio-proof',3,2),('backend','communication',3,1),
('data-analyst','databases',4,3),('data-analyst','data-analysis',4,3),('data-analyst','programming-fundamentals',3,2),('data-analyst','communication',4,3),('data-analyst','problem-framing',3,2),('data-analyst','portfolio-proof',3,2),('data-analyst','git',2,1),
('embedded','programming-fundamentals',4,3),('embedded','embedded',4,3),('embedded','operating-systems',3,2),('embedded','networking',2,1),('embedded','debugging',4,3),('embedded','linux',3,2),('embedded','portfolio-proof',3,2),
('higher-studies','data-structures',4,3),('higher-studies','algorithms',4,3),('higher-studies','operating-systems',4,2),('higher-studies','networking',3,2),('higher-studies','communication',4,3),('higher-studies','problem-framing',4,2),('higher-studies','portfolio-proof',3,2);

INSERT INTO public.career_tracks (slug, title, description, career_goal, branch_slug, horizon, order_index) VALUES
('placement-sprint','Campus placement sprint','A 12-week sequence from fundamentals to offer-ready: DSA volume, one shippable project, resume, mock interviews and communication reps.','placement',NULL,'12 weeks',1),
('builder-track','Builder track','For students who want to ship. Three projects of increasing ambition, a public portfolio and a habit of writing about the work.','projects',NULL,'16 weeks',2),
('core-depth','Core-subject depth','Go deep on the fundamentals your degree is built on, with weekly explanation practice to prove understanding.','core-skills',NULL,'10 weeks',3),
('higher-studies-prep','Higher-studies preparation','Fundamentals, a research-flavoured project and the written communication an application needs.','higher-studies',NULL,'14 weeks',4);

INSERT INTO public.career_track_steps (track_slug, phase, title, description, route, order_index) VALUES
('placement-sprint','Weeks 1-3','Rebuild fundamentals','Finish one programming course and clear the arrays, strings and hashmap sets in DSA practice.','/dsa',1),
('placement-sprint','Weeks 1-3','Set a daily rhythm','Complete your daily mission at least five days a week. Streak over intensity.','/tasks',2),
('placement-sprint','Weeks 4-6','Ship one real project','Register a project, break it into milestones and finish it. One finished build beats three abandoned ones.','/projects',3),
('placement-sprint','Weeks 4-6','Rate your skills honestly','Run the skill gap analyzer against the software engineer role and fix the two biggest gaps.','/skills',4),
('placement-sprint','Weeks 7-9','Write the resume','Build an ATS-friendly resume and run the deterministic checks until every section passes.','/resume',5),
('placement-sprint','Weeks 7-9','Rebuild your LinkedIn','Draft headline, about and experience sections in the career center and self-score them.','/linkedin',6),
('placement-sprint','Weeks 10-12','Mock interviews','Answer at least 10 questions across HR, behavioural and technical tracks and review the criteria feedback.','/interview',7),
('placement-sprint','Weeks 10-12','Communication reps','Do three communication drills a week, focusing on the self-introduction and project explanation.','/communication',8),
('builder-track','Phase 1','Pick a small brief','Choose a project idea you can finish in two weeks and write its milestones before writing code.','/projects',1),
('builder-track','Phase 1','Get fluent with Git','Work through the Git hub topics and use branches on every project from now on.','/git',2),
('builder-track','Phase 2','Ship something people use','Second project: real users, even if only ten. Record what changed after feedback.','/projects',3),
('builder-track','Phase 2','Publish your portfolio','Turn on your public portfolio page and add your two strongest builds.','/portfolio',4),
('builder-track','Phase 3','Write about the work','Draft one build-log post per project in the LinkedIn career center.','/linkedin',5),
('builder-track','Phase 3','Third project with depth','Add a harder technical dimension: data, concurrency, hardware or scale.','/projects',6),
('core-depth','Block 1','Map your gaps','Rate yourself across the core skills and pick the three weakest with the highest weight.','/skills',1),
('core-depth','Block 1','One course at a time','Finish a full course rather than sampling four. Mark lessons complete as you go.','/learn',2),
('core-depth','Block 2','Prove it by explaining','Use the Explain track in the communication academy twice a week on what you just studied.','/communication',3),
('core-depth','Block 2','Apply it in code','Turn each finished topic into a small program or SQL exercise.','/sql-lab',4),
('core-depth','Block 3','Branch-core interview set','Answer the branch-core interview questions and compare against the criteria.','/interview',5),
('higher-studies-prep','Stage 1','Strengthen the core four','Data structures, algorithms, operating systems and networks — rated 4+ before moving on.','/skills',1),
('higher-studies-prep','Stage 1','Deep course work','Complete the relevant courses end to end and keep notes.','/learn',2),
('higher-studies-prep','Stage 2','A research-flavoured project','Pick a project with a question, not just a feature list, and document the method.','/projects',3),
('higher-studies-prep','Stage 2','Writing practice','Use the writing drills weekly; statements of purpose are judged on clarity.','/communication',4),
('higher-studies-prep','Stage 3','Academic profile','Keep a public portfolio and a clean resume aimed at admissions, not recruiters.','/portfolio',5);