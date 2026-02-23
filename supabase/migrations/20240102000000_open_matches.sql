-- ============================================================
-- TENIS APP — Open Matches Feature
-- ============================================================

-- ============================================================
-- OPEN_MATCHES TABLE
-- ============================================================
CREATE TABLE public.open_matches (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  scheduled_at   TIMESTAMPTZ NOT NULL,
  location_city  TEXT,
  location_name  TEXT,
  skill_min      skill_level,
  skill_max      skill_level,
  format         match_format NOT NULL DEFAULT 'best_of_3',
  message        TEXT CHECK (char_length(message) <= 300),
  status         TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'filled', 'cancelled')),
  filled_by      UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_open_matches_status ON public.open_matches(status) WHERE status = 'open';
CREATE INDEX idx_open_matches_scheduled_at ON public.open_matches(scheduled_at) WHERE status = 'open';
CREATE INDEX idx_open_matches_creator ON public.open_matches(creator_id);
CREATE INDEX idx_open_matches_city ON public.open_matches(location_city) WHERE status = 'open';

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.open_matches ENABLE ROW LEVEL SECURITY;

-- Authenticated users can SELECT open matches
CREATE POLICY "open_matches_select_open"
  ON public.open_matches
  FOR SELECT
  TO authenticated
  USING (status = 'open');

-- Creators can UPDATE their own open matches
CREATE POLICY "open_matches_update_own"
  ON public.open_matches
  FOR UPDATE
  TO authenticated
  USING (creator_id = auth.uid());

-- Authenticated users can INSERT (create open matches)
CREATE POLICY "open_matches_insert_authenticated"
  ON public.open_matches
  FOR INSERT
  TO authenticated
  WITH CHECK (creator_id = auth.uid());

-- service_role bypasses RLS by default (no policy needed)
