-- Phase 4: Job tracker, aptitude drills, certifications planner

create type public.application_status as enum ('saved', 'applied', 'assessment', 'interview', 'offer', 'rejected', 'withdrawn');

create table public.job_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  company text not null,
  role_title text not null,
  job_url text,
  source text,
  status public.application_status not null default 'saved',
  applied_on date,
  deadline date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.job_applications to authenticated;
grant all on public.job_applications to service_role;
alter table public.job_applications enable row level security;
create policy "Users manage their own applications"
  on public.job_applications for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create trigger job_applications_updated_at before update on public.job_applications
  for each row execute function public.set_updated_at();

create table public.aptitude_questions (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  topic text not null,
  level text not null,
  question text not null,
  options jsonb not null,
  answer_index integer not null,
  explanation text not null,
  order_index integer not null default 0,
  created_at timestamptz not null default now()
);
grant select on public.aptitude_questions to authenticated;
grant all on public.aptitude_questions to service_role;
alter table public.aptitude_questions enable row level security;
create policy "Authenticated read aptitude questions"
  on public.aptitude_questions for select to authenticated using (true);

create table public.aptitude_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  question_id uuid not null references public.aptitude_questions(id) on delete cascade,
  chosen_index integer not null,
  is_correct boolean not null,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.aptitude_attempts to authenticated;
grant all on public.aptitude_attempts to service_role;
alter table public.aptitude_attempts enable row level security;
create policy "Users manage their own aptitude attempts"
  on public.aptitude_attempts for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table public.certifications_catalogue (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  provider text not null,
  domain text not null,
  level text not null,
  summary text not null,
  est_hours integer not null default 10,
  url text,
  order_index integer not null default 0,
  created_at timestamptz not null default now()
);
grant select on public.certifications_catalogue to authenticated;
grant all on public.certifications_catalogue to service_role;
alter table public.certifications_catalogue enable row level security;
create policy "Authenticated read certifications catalogue"
  on public.certifications_catalogue for select to authenticated using (true);

create table public.certification_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  certification_id uuid not null references public.certifications_catalogue(id) on delete cascade,
  status text not null default 'interested' check (status in ('interested', 'in_progress', 'completed')),
  target_date date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, certification_id)
);
grant select, insert, update, delete on public.certification_plans to authenticated;
grant all on public.certification_plans to service_role;
alter table public.certification_plans enable row level security;
create policy "Users manage their own certification plans"
  on public.certification_plans for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create trigger certification_plans_updated_at before update on public.certification_plans
  for each row execute function public.set_updated_at();

-- Seed aptitude questions (self-authored practice items)
insert into public.aptitude_questions (slug, topic, level, question, options, answer_index, explanation, order_index) values
('apt-q1', 'quant', 'easy', 'A train 120 m long passes a pole in 12 seconds. What is its speed in km/h?', '["30 km/h", "36 km/h", "40 km/h", "42 km/h"]'::jsonb, 1, 'Speed = 120/12 = 10 m/s = 10 x 3.6 = 36 km/h.', 1),
('apt-q2', 'quant', 'easy', 'What is 15% of 240?', '["32", "36", "40", "46"]'::jsonb, 1, '10% of 240 is 24; 5% is 12; 24 + 12 = 36.', 2),
('apt-q3', 'logical', 'easy', 'Find the next term: 2, 6, 12, 20, 30, ?', '["40", "42", "44", "48"]'::jsonb, 1, 'Differences are 4, 6, 8, 10 — next difference is 12, so 30 + 12 = 42.', 3),
('apt-q4', 'verbal', 'easy', 'Choose the synonym of CANDID.', '["Deceptive", "Frank", "Timid", "Rude"]'::jsonb, 1, 'Candid means truthful and straightforward — frank.', 4),
('apt-q5', 'quant', 'medium', 'If 5 workers build a wall in 12 days, how many days will 3 workers take for the same wall?', '["18", "20", "22", "24"]'::jsonb, 1, 'Work = 5 x 12 = 60 worker-days; 60 / 3 = 20 days.', 5),
('apt-q6', 'logical', 'medium', 'In a row of 40 students, A is 12th from the left and B is 9th from the right. How many students are between them?', '["17", "18", "19", "20"]'::jsonb, 2, 'B from left = 40 - 9 + 1 = 32. Between position 12 and 32: 32 - 12 - 1 = 19.', 6),
('apt-q7', 'verbal', 'medium', 'Choose the correctly spelt word.', '["Occassion", "Ocasion", "Occasion", "Occasionn"]'::jsonb, 2, 'The correct spelling is "Occasion" — double c, single s.', 7),
('apt-q8', 'quant', 'medium', 'The average of 5 numbers is 20. If one number is excluded, the average becomes 18. What is the excluded number?', '["24", "26", "28", "30"]'::jsonb, 2, 'Sum of 5 = 100; sum of 4 = 72; excluded = 100 - 72 = 28.', 8),
('apt-q9', 'logical', 'easy', 'If CODING is written as DPEJOH, how is TRAIN written?', '["USBJO", "USBKO", "USBKP", "USAKO"]'::jsonb, 0, 'Each letter shifts +1: T->U, R->S, A->B, I->J, N->O.', 9),
('apt-q10', 'verbal', 'easy', 'Choose the antonym of TRANSPARENT.', '["Clear", "Opaque", "Fragile", "Thin"]'::jsonb, 1, 'Transparent means see-through; its opposite is opaque.', 10);

-- Seed certifications catalogue (guidance only — enrolment happens on the provider sites)
insert into public.certifications_catalogue (slug, title, provider, domain, level, summary, est_hours, url, order_index) values
('cert-aws-ccp', 'AWS Certified Cloud Practitioner', 'Amazon Web Services', 'Cloud', 'beginner', 'Entry-level cloud certification covering AWS services, billing, and shared responsibility. Good first cloud credential.', 40, 'https://aws.amazon.com/certification/certified-cloud-practitioner/', 1),
('cert-cka', 'Certified Kubernetes Administrator', 'CNCF', 'DevOps', 'advanced', 'Hands-on exam on cluster administration, networking, and troubleshooting. Respected for platform and SRE roles.', 80, 'https://www.cncf.io/training/certification/cka/', 2),
('cert-meta-fe', 'Meta Front-End Developer Certificate', 'Meta / Coursera', 'Web development', 'beginner', 'Project-based certificate covering React, HTML/CSS, and UI principles taught with Meta tooling.', 60, 'https://www.coursera.org/professional-certificates/meta-front-end-developer', 3),
('cert-google-data', 'Google Data Analytics Certificate', 'Google / Coursera', 'Data', 'beginner', 'Spreadsheets, SQL, R, and Tableau fundamentals with case-study projects.', 80, 'https://www.coursera.org/professional-certificates/google-data-analytics', 4),
('cert-az-900', 'Microsoft Azure Fundamentals (AZ-900)', 'Microsoft', 'Cloud', 'beginner', 'Foundational Azure concepts: core services, pricing, governance. One-hour multiple-choice exam.', 30, 'https://learn.microsoft.com/credentials/certifications/azure-fundamentals/', 5),
('cert-ccna', 'Cisco Certified Network Associate (CCNA)', 'Cisco', 'Networking', 'intermediate', 'Networking fundamentals, IP connectivity, security and automation. Strong signal for network and infra roles.', 120, 'https://www.cisco.com/site/us/en/learn/training-certifications/certifications/enterprise/ccna/index.html', 6);