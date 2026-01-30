-- =============================================
-- CCAT Assessment Platform - Phase 1 MVP Schema
-- =============================================

-- Create enum types
CREATE TYPE public.user_role AS ENUM ('employer', 'candidate', 'admin');
CREATE TYPE public.organization_size AS ENUM ('startup', 'smb', 'midmarket', 'enterprise');
CREATE TYPE public.bundle_type AS ENUM ('starter', 'professional', 'enterprise');
CREATE TYPE public.test_category AS ENUM ('cognitive', 'personality', 'skills', 'situational');
CREATE TYPE public.question_type AS ENUM ('multiple_choice', 'true_false', 'short_answer');
CREATE TYPE public.invitation_status AS ENUM ('pending', 'started', 'completed', 'expired');
CREATE TYPE public.session_status AS ENUM ('in_progress', 'completed', 'abandoned');

-- =============================================
-- 1. Organizations Table
-- =============================================
CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  industry VARCHAR(100),
  size_category organization_size DEFAULT 'startup',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_organizations_slug ON public.organizations(slug);

-- =============================================
-- 2. Profiles Table (extends auth.users)
-- =============================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  role user_role NOT NULL DEFAULT 'candidate',
  organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_organization ON public.profiles(organization_id);
CREATE INDEX idx_profiles_role ON public.profiles(role);

-- =============================================
-- 3. User Roles Table (for proper role management)
-- =============================================
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role user_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, role)
);

CREATE INDEX idx_user_roles_user ON public.user_roles(user_id);

-- =============================================
-- 4. Test Library Table
-- =============================================
CREATE TABLE public.test_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  category test_category NOT NULL DEFAULT 'cognitive',
  subcategory VARCHAR(100),
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  question_count INTEGER NOT NULL DEFAULT 20,
  difficulty_level VARCHAR(50) DEFAULT 'medium',
  recommended_for JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT TRUE,
  requires_proctoring BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_test_library_category ON public.test_library(category);
CREATE INDEX idx_test_library_slug ON public.test_library(slug);
CREATE INDEX idx_test_library_active ON public.test_library(is_active);

-- =============================================
-- 5. Test Questions Table
-- =============================================
CREATE TABLE public.test_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID NOT NULL REFERENCES public.test_library(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type question_type NOT NULL DEFAULT 'multiple_choice',
  options JSONB DEFAULT '[]'::jsonb,
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  difficulty VARCHAR(50) DEFAULT 'medium',
  time_limit_seconds INTEGER,
  points INTEGER DEFAULT 1,
  order_number INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_questions_test ON public.test_questions(test_id);
CREATE INDEX idx_questions_order ON public.test_questions(test_id, order_number);

-- =============================================
-- 6. Test Bundles Table
-- =============================================
CREATE TABLE public.test_bundles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  bundle_type bundle_type NOT NULL,
  tests_purchased INTEGER NOT NULL,
  tests_remaining INTEGER NOT NULL,
  amount_paid INTEGER NOT NULL DEFAULT 0,
  stripe_payment_id VARCHAR(255),
  purchased_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bundles_org ON public.test_bundles(organization_id);
CREATE INDEX idx_bundles_type ON public.test_bundles(bundle_type);

-- =============================================
-- 7. Test Invitations Table
-- =============================================
CREATE TABLE public.test_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  test_id UUID NOT NULL REFERENCES public.test_library(id) ON DELETE CASCADE,
  candidate_email VARCHAR(255) NOT NULL,
  candidate_name VARCHAR(255),
  invited_by UUID REFERENCES auth.users(id),
  status invitation_status DEFAULT 'pending',
  invitation_token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_invitations_org ON public.test_invitations(organization_id);
CREATE INDEX idx_invitations_token ON public.test_invitations(invitation_token);
CREATE INDEX idx_invitations_email ON public.test_invitations(candidate_email);
CREATE INDEX idx_invitations_status ON public.test_invitations(status);

-- =============================================
-- 8. Test Sessions Table
-- =============================================
CREATE TABLE public.test_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id UUID REFERENCES public.test_invitations(id) ON DELETE SET NULL,
  test_id UUID NOT NULL REFERENCES public.test_library(id) ON DELETE CASCADE,
  candidate_id UUID REFERENCES auth.users(id),
  session_type VARCHAR(50) NOT NULL DEFAULT 'real',
  status session_status DEFAULT 'in_progress',
  current_question_index INTEGER DEFAULT 0,
  answers JSONB DEFAULT '[]'::jsonb,
  start_time TIMESTAMPTZ DEFAULT NOW(),
  end_time TIMESTAMPTZ,
  time_remaining_seconds INTEGER,
  ip_address VARCHAR(45),
  user_agent TEXT,
  proctoring_enabled BOOLEAN DEFAULT TRUE,
  proctoring_consent_given BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sessions_invitation ON public.test_sessions(invitation_id);
CREATE INDEX idx_sessions_candidate ON public.test_sessions(candidate_id);
CREATE INDEX idx_sessions_status ON public.test_sessions(status);

-- =============================================
-- 9. Test Results Table
-- =============================================
CREATE TABLE public.test_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.test_sessions(id) ON DELETE CASCADE,
  invitation_id UUID REFERENCES public.test_invitations(id),
  test_id UUID NOT NULL REFERENCES public.test_library(id),
  candidate_email VARCHAR(255) NOT NULL,
  organization_id UUID REFERENCES public.organizations(id),
  score INTEGER NOT NULL,
  percentage DECIMAL(5,2) NOT NULL,
  percentile DECIMAL(5,2),
  time_taken_seconds INTEGER,
  category_scores JSONB DEFAULT '{}'::jsonb,
  question_breakdown JSONB DEFAULT '[]'::jsonb,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_results_session ON public.test_results(session_id);
CREATE INDEX idx_results_org ON public.test_results(organization_id);
CREATE INDEX idx_results_test ON public.test_results(test_id);
CREATE INDEX idx_results_candidate ON public.test_results(candidate_email);

-- =============================================
-- HELPER FUNCTIONS (SECURITY DEFINER)
-- =============================================

-- Check if user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role user_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(_user_id, 'admin')
$$;

-- Check if user is employer
CREATE OR REPLACE FUNCTION public.is_employer(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(_user_id, 'employer')
$$;

-- Check if user is candidate
CREATE OR REPLACE FUNCTION public.is_candidate(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(_user_id, 'candidate')
$$;

-- Get user's organization ID
CREATE OR REPLACE FUNCTION public.get_user_org_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT organization_id FROM public.profiles WHERE id = _user_id
$$;

-- Check if user belongs to organization
CREATE OR REPLACE FUNCTION public.user_belongs_to_org(_user_id UUID, _org_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = _user_id AND organization_id = _org_id
  )
$$;

-- Get user email
CREATE OR REPLACE FUNCTION public.get_user_email(_user_id UUID)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT email FROM public.profiles WHERE id = _user_id
$$;

-- =============================================
-- ENABLE RLS ON ALL TABLES
-- =============================================
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_bundles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_results ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES
-- =============================================

-- Organizations: Employers can see their own org, admins see all
CREATE POLICY "org_select" ON public.organizations FOR SELECT USING (
  public.is_admin(auth.uid()) OR 
  public.user_belongs_to_org(auth.uid(), id)
);

CREATE POLICY "org_update" ON public.organizations FOR UPDATE USING (
  public.is_admin(auth.uid()) OR 
  (public.is_employer(auth.uid()) AND public.user_belongs_to_org(auth.uid(), id))
);

CREATE POLICY "org_insert" ON public.organizations FOR INSERT WITH CHECK (true);

-- Profiles: Users can see and update their own profile
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT USING (
  auth.uid() = id OR 
  public.is_admin(auth.uid()) OR
  (public.is_employer(auth.uid()) AND public.user_belongs_to_org(auth.uid(), organization_id))
);

CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE USING (
  auth.uid() = id OR public.is_admin(auth.uid())
);

CREATE POLICY "profiles_insert" ON public.profiles FOR INSERT WITH CHECK (
  auth.uid() = id
);

-- User Roles: Only admins can manage, users can see their own
CREATE POLICY "roles_select" ON public.user_roles FOR SELECT USING (
  user_id = auth.uid() OR public.is_admin(auth.uid())
);

CREATE POLICY "roles_insert" ON public.user_roles FOR INSERT WITH CHECK (
  user_id = auth.uid()
);

-- Test Library: Public for viewing (employers and admins)
CREATE POLICY "test_library_select" ON public.test_library FOR SELECT USING (
  is_active = true OR public.is_admin(auth.uid())
);

-- Test Questions: Only accessible during active sessions or by admins
CREATE POLICY "questions_select" ON public.test_questions FOR SELECT USING (
  public.is_admin(auth.uid()) OR
  EXISTS (
    SELECT 1 FROM public.test_sessions ts
    WHERE ts.test_id = test_questions.test_id
      AND ts.candidate_id = auth.uid()
      AND ts.status = 'in_progress'
  )
);

-- Test Bundles: Organization members can see their bundles
CREATE POLICY "bundles_select" ON public.test_bundles FOR SELECT USING (
  public.is_admin(auth.uid()) OR
  public.user_belongs_to_org(auth.uid(), organization_id)
);

CREATE POLICY "bundles_insert" ON public.test_bundles FOR INSERT WITH CHECK (
  public.is_admin(auth.uid()) OR
  (public.is_employer(auth.uid()) AND public.user_belongs_to_org(auth.uid(), organization_id))
);

CREATE POLICY "bundles_update" ON public.test_bundles FOR UPDATE USING (
  public.is_admin(auth.uid()) OR
  (public.is_employer(auth.uid()) AND public.user_belongs_to_org(auth.uid(), organization_id))
);

-- Test Invitations: Employers can CRUD for their org, candidates can see theirs
CREATE POLICY "invitations_select" ON public.test_invitations FOR SELECT USING (
  public.is_admin(auth.uid()) OR
  public.user_belongs_to_org(auth.uid(), organization_id) OR
  candidate_email = public.get_user_email(auth.uid())
);

CREATE POLICY "invitations_insert" ON public.test_invitations FOR INSERT WITH CHECK (
  public.is_employer(auth.uid()) AND public.user_belongs_to_org(auth.uid(), organization_id)
);

CREATE POLICY "invitations_update" ON public.test_invitations FOR UPDATE USING (
  public.is_admin(auth.uid()) OR
  (public.is_employer(auth.uid()) AND public.user_belongs_to_org(auth.uid(), organization_id)) OR
  candidate_email = public.get_user_email(auth.uid())
);

CREATE POLICY "invitations_delete" ON public.test_invitations FOR DELETE USING (
  public.is_admin(auth.uid()) OR
  (public.is_employer(auth.uid()) AND public.user_belongs_to_org(auth.uid(), organization_id))
);

-- Test Sessions: Candidates can manage their own sessions
CREATE POLICY "sessions_select" ON public.test_sessions FOR SELECT USING (
  public.is_admin(auth.uid()) OR
  candidate_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.test_invitations ti
    WHERE ti.id = test_sessions.invitation_id
      AND public.user_belongs_to_org(auth.uid(), ti.organization_id)
  )
);

CREATE POLICY "sessions_insert" ON public.test_sessions FOR INSERT WITH CHECK (
  candidate_id = auth.uid()
);

CREATE POLICY "sessions_update" ON public.test_sessions FOR UPDATE USING (
  candidate_id = auth.uid() OR public.is_admin(auth.uid())
);

-- Test Results: Org members and candidate can see
CREATE POLICY "results_select" ON public.test_results FOR SELECT USING (
  public.is_admin(auth.uid()) OR
  public.user_belongs_to_org(auth.uid(), organization_id) OR
  candidate_email = public.get_user_email(auth.uid())
);

CREATE POLICY "results_insert" ON public.test_results FOR INSERT WITH CHECK (
  candidate_email = public.get_user_email(auth.uid())
);

-- =============================================
-- TRIGGERS
-- =============================================

-- Update timestamps trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to relevant tables
CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_test_library_updated_at
  BEFORE UPDATE ON public.test_library
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- SEED DATA: Sample Test Library
-- =============================================

INSERT INTO public.test_library (name, slug, description, category, subcategory, duration_minutes, question_count, difficulty_level, recommended_for) VALUES
('CCAT - Cognitive Aptitude', 'ccat-cognitive', 'The Criteria Cognitive Aptitude Test measures problem-solving abilities, learning capability, and critical thinking skills.', 'cognitive', 'general', 15, 50, 'medium', '["Software Engineer", "Product Manager", "Analyst", "Manager"]'),
('Verbal Reasoning', 'verbal-reasoning', 'Assess ability to understand and interpret written information, draw logical conclusions, and communicate effectively.', 'cognitive', 'verbal', 20, 25, 'medium', '["Marketing", "Sales", "Customer Success", "HR"]'),
('Numerical Reasoning', 'numerical-reasoning', 'Evaluate mathematical aptitude, data interpretation, and quantitative problem-solving skills.', 'cognitive', 'numerical', 20, 20, 'medium', '["Finance", "Accounting", "Data Analyst", "Operations"]'),
('Logical Reasoning', 'logical-reasoning', 'Test abstract thinking, pattern recognition, and deductive reasoning abilities.', 'cognitive', 'logical', 15, 20, 'hard', '["Developer", "Architect", "Consultant", "Researcher"]'),
('Abstract Reasoning', 'abstract-reasoning', 'Measure ability to identify patterns, relationships, and solve novel problems.', 'cognitive', 'abstract', 15, 25, 'hard', '["Designer", "Engineer", "Strategist"]');