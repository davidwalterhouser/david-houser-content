-- ============================================================
-- @davidhouser Content Command Center — Supabase Schema
-- Run this in your Supabase SQL editor to set up all tables.
-- ============================================================

-- ── Posts (Content Pipeline) ──────────────────────────────
create table if not exists posts (
  id               uuid primary key default gen_random_uuid(),
  title            text not null,
  platform         text not null check (platform in ('instagram','tiktok','youtube','facebook','multi')),
  type             text not null,            -- reel, story, video, post, short
  month            integer not null check (month in (1, 2)),
  status           text not null default 'filming'
                     check (status in ('filming','editing','ready','posted')),
  pillar           text,                     -- Personal Brand, Education, etc.
  effort           text check (effort in ('Low','Medium','High')),
  platforms        text[],                   -- distribution platforms array
  hook             text,                     -- first 3-second hook
  what             text,                     -- what to film instructions
  caption_starter  text,                     -- caption copy starter
  viral_note       text,                     -- viral strategy note
  platform_note    text,                     -- platform distribution strategy
  beast            text default 'None',      -- None / Mention / Soft / Natural / Featured
  bowmar           text default 'None',
  notes            text,
  due_date         date,
  position         integer default 0,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

-- ── Growth Goals (one row per platform) ───────────────────
create table if not exists growth_goals (
  id          uuid primary key default gen_random_uuid(),
  platform    text not null unique check (platform in ('instagram','facebook','youtube','tiktok')),
  start_count integer not null default 0,
  goal_count  integer not null default 10000,
  start_date  date not null default current_date,
  end_date    date not null default (current_date + interval '90 days'),
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ── Growth Metrics (daily snapshots) ──────────────────────
create table if not exists growth_metrics (
  id             uuid primary key default gen_random_uuid(),
  platform       text not null check (platform in ('instagram','facebook','youtube','tiktok')),
  follower_count integer not null,
  recorded_date  date not null default current_date,
  created_at     timestamptz default now(),
  unique(platform, recorded_date)
);

-- ── Ideas Log ─────────────────────────────────────────────
create table if not exists ideas (
  id         uuid primary key default gen_random_uuid(),
  title      text,
  content    text,
  audio_url  text,
  tags       text[] default '{}',
  platform   text,
  status     text not null default 'raw' check (status in ('raw','refined','used')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ── Roadmap Tasks ─────────────────────────────────────────
create table if not exists roadmap_tasks (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text,
  assignee    text not null check (assignee in ('me','editor','va')),
  status      text not null default 'todo' check (status in ('todo','in-progress','done')),
  priority    text not null default 'medium' check (priority in ('low','medium','high')),
  week        integer,
  due_date    date,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ── updated_at trigger ────────────────────────────────────
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

create or replace trigger posts_updated_at
  before update on posts for each row execute function set_updated_at();
create or replace trigger growth_goals_updated_at
  before update on growth_goals for each row execute function set_updated_at();
create or replace trigger ideas_updated_at
  before update on ideas for each row execute function set_updated_at();
create or replace trigger roadmap_tasks_updated_at
  before update on roadmap_tasks for each row execute function set_updated_at();

-- ── Enable Row Level Security (open for team use) ─────────
alter table posts          enable row level security;
alter table growth_goals   enable row level security;
alter table growth_metrics enable row level security;
alter table ideas          enable row level security;
alter table roadmap_tasks  enable row level security;

create policy "Public read/write posts"          on posts          for all using (true) with check (true);
create policy "Public read/write growth_goals"   on growth_goals   for all using (true) with check (true);
create policy "Public read/write growth_metrics" on growth_metrics for all using (true) with check (true);
create policy "Public read/write ideas"          on ideas          for all using (true) with check (true);
create policy "Public read/write roadmap_tasks"  on roadmap_tasks  for all using (true) with check (true);

-- ============================================================
-- SEED DATA
-- ============================================================

-- ── Growth Goals seed ─────────────────────────────────────
insert into growth_goals (platform, start_count, goal_count, start_date, end_date) values
  ('instagram', 2400, 10000, current_date, current_date + 90),
  ('tiktok',    1800, 8000,  current_date, current_date + 90),
  ('youtube',    620, 5000,  current_date, current_date + 90),
  ('facebook',   980, 4000,  current_date, current_date + 90)
on conflict (platform) do nothing;

-- ── Growth Metrics seed (today's starting snapshot) ───────
insert into growth_metrics (platform, follower_count, recorded_date) values
  ('instagram', 2400, current_date),
  ('tiktok',    1800, current_date),
  ('youtube',    620, current_date),
  ('facebook',   980, current_date)
on conflict (platform, recorded_date) do nothing;

-- ── 53 Posts seed ─────────────────────────────────────────
insert into posts (title, platform, type, month, status, hook, notes, position) values

-- MONTH 1 — Instagram Reels (8)
('My 5am morning routine as a bow hunter',       'instagram', 'reel', 1, 'posted',  'What does a 5am bowhunter morning look like?', 'Show gear prep, coffee, map review', 1),
('3 mistakes I made my first season bowhunting', 'instagram', 'reel', 1, 'posted',  'I made every mistake in the book — here's what I learned',  'Relatable, educational, use B-roll of old footage', 2),
('How I set up my home archery range',           'instagram', 'reel', 1, 'posted',  'You don''t need a huge yard to practice archery',           'Backyard setup walkthrough', 3),
('Behind the scenes: what goes into a hunting video', 'instagram', 'reel', 1, 'posted', 'This one clip took 3 days to get',                   'Show the unseen effort — camera rigs, hikes, patience', 4),
('Bow hunting gear I can''t live without',       'instagram', 'reel', 1, 'ready',   'These 5 items are always in my pack',                       'Product showcase, link in bio', 5),
('How I film myself solo hunting',               'instagram', 'reel', 1, 'ready',   'Solo hunting content is hard — here''s my setup',          'Camera arm, GoPro angles, editing tips', 6),
('The shot that changed my season',              'instagram', 'reel', 1, 'editing', 'I almost didn''t take this shot',                           'Emotional storytelling, slow-mo footage', 7),
('Day in the life: content creator + hunter',   'instagram', 'reel', 1, 'editing', '6am to midnight — this is my reality',                      'Lifestyle content, authentic and raw', 8),

-- MONTH 1 — TikTok (7)
('POV: setting up a treestand at 4am',          'tiktok', 'short', 1, 'posted',  'POV it''s 4am and you''re 20 feet up a tree',               'Dark + headlamp only, atmospheric', 9),
('Archery tips in 60 seconds',                  'tiktok', 'short', 1, 'posted',  '60 seconds of archery knowledge that took me years to learn', 'Fast-cut tips, text overlays', 10),
('Things hunters say vs what they mean',        'tiktok', 'short', 1, 'posted',  'Translation guide for non-hunters',                          'Comedy format, trending audio', 11),
('Reacting to my worst hunting shots',          'tiktok', 'short', 1, 'ready',   'Watching cringe so you don''t have to',                      'Self-deprecating, relatable', 12),
('How NOT to release an arrow',                 'tiktok', 'short', 1, 'editing', 'Don''t be like me',                                          'Comedy + education, use old clips', 13),
('My favorite calls for calling in bucks',      'tiktok', 'short', 1, 'editing', 'These 3 calls work every time',                              'Educational, product display', 14),
('Pack out day is always worth it',             'tiktok', 'short', 1, 'filming', 'The hardest part of hunting is also the best part',          'Inspirational, heavy pack footage', 15),

-- MONTH 1 — YouTube (5)
('Full Day Solo Bowhunt | Public Land Whitetail', 'youtube', 'video', 1, 'posted', 'Solo public land — will it pay off?',  'Full vlog format, 15-20 min, B-roll heavy', 16),
('How I Grew My Hunting Instagram to 10k',        'youtube', 'video', 1, 'posted', 'The honest strategy that actually worked', 'Education + behind brand story', 17),
('My Complete Bow Setup for This Season',         'youtube', 'video', 1, 'editing','Everything on my bow and why',          'Gear review, Amazon affiliate links', 18),
('Hunting a New Farm | Permission Land Bowhunt',  'youtube', 'video', 1, 'editing','First time on this property — let''s see it', 'Scouting + hunting combo vlog', 19),
('Shot Placement for Ethical Kills: Full Guide',  'youtube', 'video', 1, 'filming', 'The guide I wish existed when I started', 'Educational deep-dive, diagrams', 20),

-- MONTH 1 — Facebook (4)
('Gear spotlight: my go-to broadhead',          'facebook', 'post', 1, 'posted',  'The broadhead I keep going back to',     'Product feature, community comments', 21),
('What motivates me to hunt every season',      'facebook', 'post', 1, 'ready',   'My why behind every early morning',      'Personal story, high engagement', 22),
('Community post: what''s your dream hunt?',   'facebook', 'post', 1, 'filming', 'Drop your dream hunt below 👇',          'Engagement bait, comment replies', 23),
('Your best hunt of the year — share it',       'facebook', 'post', 1, 'filming', 'Let''s celebrate your wins',             'Community UGC post', 24),

-- MONTH 1 — Multi-platform (3)
('Weekly motivation for hunters',               'multi', 'post', 1, 'posted',  'Success is just another hunt away',        'Quote graphic + short caption', 25),
('Hunting mindset: patience and persistence',   'multi', 'post', 1, 'ready',   'The mental game of bowhunting',            'Cross-post to all platforms', 26),
('Tag a hunting buddy who needs to see this',   'multi', 'post', 1, 'filming', 'Every hunter knows this feeling',          'Viral engagement format', 27),

-- MONTH 2 — Instagram Reels (7)
('My editing workflow for hunting content',          'instagram', 'reel', 2, 'ready',   'How I edit a full hunt in one evening',          'Screen record workflow, CapCut/Premiere tips', 28),
('How I plan a 90-day content calendar',             'instagram', 'reel', 2, 'ready',   'Stop winging your content — here''s my system', 'Show the actual spreadsheet/board', 29),
('What I wish I knew before my first solo hunt',     'instagram', 'reel', 2, 'ready',   'Save yourself the learning curve',               'Storytelling + tips, relatable hook', 30),
('Treestand safety tips every hunter needs',         'instagram', 'reel', 2, 'editing', 'This isn''t optional — it could save your life',  'PSA format, serious tone', 31),
('Best locations I scouted this year',               'instagram', 'reel', 2, 'editing', 'Map scouting changed everything for me',         'Show OnX maps, scouting footage', 32),
('Arrow selection: what actually matters',           'instagram', 'reel', 2, 'filming', 'Forget the marketing — here''s the truth',       'Education, product comparison', 33),
('From footage to viral reel in under an hour',      'instagram', 'reel', 2, 'filming', 'My fast-edit process revealed',                  'Speed editing tutorial', 34),

-- MONTH 2 — TikTok (7)
('Hunting facts that''ll blow your mind',           'tiktok', 'short', 2, 'ready',   'I had no idea deer could do this',       'Green screen + facts format', 35),
('Hunting tier list: stands blinds spot-and-stalk', 'tiktok', 'short', 2, 'editing', 'Ranking every hunting method S to F',    'Tier list format, hot takes', 36),
('My broadhead test in slow motion',                'tiktok', 'short', 2, 'editing', 'Watch this in slow mo and tell me it''s not beautiful', 'Slow-mo B-roll, satisfying content', 37),
('Hunter vs non-hunter expectations',               'tiktok', 'short', 2, 'filming', 'What they think vs what it actually is', 'Comedy split-screen format', 38),
('What my hunting pack contains',                   'tiktok', 'short', 2, 'filming', 'Every item earns its weight',            'Full pack dump, educational', 39),
('Silent treestand setup tips',                     'tiktok', 'short', 2, 'filming', 'Noise kills hunts — here''s how I stay silent', 'Educational, product mentions', 40),
('The moment in hunting that made me emotional',    'tiktok', 'short', 2, 'filming', 'I didn''t expect to feel this way',      'Vulnerable storytelling, high share value', 41),

-- MONTH 2 — YouTube (4)
('I Hunted a State I''ve Never Been To | Elk Vlog', 'youtube', 'video', 2, 'editing', 'New state, new species, no idea what I''m doing', 'Adventure vlog, 20-25 min', 42),
('Building My Dream Content Studio',                'youtube', 'video', 2, 'filming', 'Setting up the ultimate hunting creator studio',  'Studio build vlog, gear links', 43),
('The Truth About Being a Hunting Content Creator', 'youtube', 'video', 2, 'filming', 'What no one tells you about this life',           'Raw honest story, no B-roll needed', 44),
('Public Land Late Season Bowhunt | Whitetail',     'youtube', 'video', 2, 'filming', 'Cold, miserable, and worth every second',         'Late season atmosphere, full vlog', 45),

-- MONTH 2 — Facebook (4)
('Year in review: my hunting highlights',            'facebook', 'post', 2, 'editing', 'What a year it has been',               'Recap post, high engagement', 46),
('Thank you to this incredible community',           'facebook', 'post', 2, 'filming', 'None of this happens without you',      'Gratitude post, personal',  47),
('Honest product review: what''s worth it',         'facebook', 'post', 2, 'filming', 'I only recommend things I actually use', 'Product review, affiliate', 48),
('Live Q&A: ask me anything about hunting content', 'facebook', 'post', 2, 'filming', 'Drop your questions below',             'Community engagement event', 49),

-- MONTH 2 — Multi-platform (4)
('Behind the brand: the @davidhouser story',         'multi', 'post', 2, 'editing', 'Where I started and where I''m going',   'Brand origin story, highly shareable', 50),
('Consistency over perfection: creator mindset',     'multi', 'post', 2, 'filming', 'Done beats perfect every single time',   'Motivational, broad appeal', 51),
('Collab announcement: new partnership dropping',    'multi', 'post', 2, 'filming', 'I''ve been working on something big',    'Tease collab, build hype', 52),
('Milestone celebration: the community is growing', 'multi', 'post', 2, 'filming', 'This community is something special',    'Follower milestone post', 53);

-- ── Roadmap Tasks seed ────────────────────────────────────
insert into roadmap_tasks (title, description, assignee, status, priority, week) values
-- Me
('Set up Supabase project and deploy app',   'Create Supabase project, run schema.sql, deploy to Vercel or Netlify', 'me', 'done',        'high',   1),
('Batch film Month 1 TikTok content',        'Film 7 TikTok shorts in one session. Use ring light + lavalier mic.', 'me', 'in-progress', 'high',   1),
('Record YouTube vlog episode 1',            'Full day hunt footage + talking head intro/outro. Target 20 min.',     'me', 'todo',        'high',   2),
('Define content pillars for 90 days',       'Education, Entertainment, Inspiration, Behind-the-scenes',            'me', 'done',        'medium', 1),
('Plan Month 2 posting schedule',            'Map each post to a day. Instagram: 1/day, TikTok: 1/day, YouTube: 2/mo.', 'me', 'todo',   'medium', 3),

-- Editor
('Edit Month 1 Instagram Reels 1-4',         'Export at 1080x1920. Add captions, color grade, music from Epidemic Sound.', 'editor', 'in-progress', 'high',   1),
('Edit YouTube episode 1 — Full hunt vlog',  'Cut to 15-20 min. Add intro sequence, chapter markers, end screen.',  'editor', 'todo',        'high',   2),
('Create reel template for brand consistency','Build a CapCut or Premiere template matching our color grade.',        'editor', 'todo',        'medium', 1),
('Edit Month 1 TikToks 1-4',                 'Fast-cut style, captions burned in, trending audio synced.',           'editor', 'todo',        'high',   2),
('Build thumbnail template for YouTube',     '1280x720 Canva or Photoshop template. Bold text, face + action.',      'editor', 'done',        'medium', 1),

-- VA
('Schedule and post Month 1 Instagram content', 'Upload to Later or Buffer. Add captions, hashtags, location tags.', 'va', 'in-progress', 'high',   1),
('Research trending audio for TikTok week 1',   'Pull top 10 trending sounds in hunting/outdoors niche.',            'va', 'done',        'medium', 1),
('Draft captions for Month 1 Facebook posts',   'Match brand voice: authentic, direct, community-focused.',          'va', 'todo',        'medium', 2),
('Pull weekly analytics and drop in dashboard', 'Instagram, TikTok, YouTube, Facebook — follower counts + top posts.','va', 'todo',       'high',   2),
('Source UGC and community reposts for Facebook','Find 5 community posts to share/feature each week.',                'va', 'todo',        'low',    3);
