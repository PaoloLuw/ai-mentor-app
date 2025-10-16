-- Create users_profile table
CREATE TABLE IF NOT EXISTS public.users_profile (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  llm_role TEXT DEFAULT 'mentor' CHECK (llm_role IN ('mentor', 'terapeuta', 'maestro')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.users_profile ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_profile_select_own" ON public.users_profile FOR SELECT USING (auth.uid() = id);
CREATE POLICY "users_profile_insert_own" ON public.users_profile FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "users_profile_update_own" ON public.users_profile FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "users_profile_delete_own" ON public.users_profile FOR DELETE USING (auth.uid() = id);

-- Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  emoji TEXT NOT NULL,
  color TEXT NOT NULL,
  is_distraction BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "categories_select_own" ON public.categories FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "categories_insert_own" ON public.categories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "categories_update_own" ON public.categories FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "categories_delete_own" ON public.categories FOR DELETE USING (auth.uid() = user_id);

-- Create activities table
CREATE TABLE IF NOT EXISTS public.activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_time TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "activities_select_own" ON public.activities FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "activities_insert_own" ON public.activities FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "activities_update_own" ON public.activities FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "activities_delete_own" ON public.activities FOR DELETE USING (auth.uid() = user_id);

-- Create thoughts table
CREATE TABLE IF NOT EXISTS public.thoughts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.thoughts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "thoughts_select_own" ON public.thoughts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "thoughts_insert_own" ON public.thoughts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "thoughts_update_own" ON public.thoughts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "thoughts_delete_own" ON public.thoughts FOR DELETE USING (auth.uid() = user_id);

-- Create goals table
CREATE TABLE IF NOT EXISTS public.goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  target_date DATE,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "goals_select_own" ON public.goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "goals_insert_own" ON public.goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "goals_update_own" ON public.goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "goals_delete_own" ON public.goals FOR DELETE USING (auth.uid() = user_id);

-- Create tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_id UUID REFERENCES public.goals(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  is_completed BOOLEAN DEFAULT FALSE,
  due_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tasks_select_own" ON public.tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "tasks_insert_own" ON public.tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "tasks_update_own" ON public.tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "tasks_delete_own" ON public.tasks FOR DELETE USING (auth.uid() = user_id);

-- Create coach_messages table
CREATE TABLE IF NOT EXISTS public.coach_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.coach_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "coach_messages_select_own" ON public.coach_messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "coach_messages_insert_own" ON public.coach_messages FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "coach_messages_delete_own" ON public.coach_messages FOR DELETE USING (auth.uid() = user_id);

-- Create insights table
CREATE TABLE IF NOT EXISTS public.insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  summary TEXT NOT NULL,
  suggestions TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "insights_select_own" ON public.insights FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "insights_insert_own" ON public.insights FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "insights_delete_own" ON public.insights FOR DELETE USING (auth.uid() = user_id);

-- Create trigger function to auto-create user profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users_profile (id, display_name, llm_role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data ->> 'display_name', 'Usuario'),
    COALESCE(new.raw_user_meta_data ->> 'llm_role', 'mentor')
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN new;
END;
$$;

-- Create trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
