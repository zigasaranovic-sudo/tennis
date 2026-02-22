-- ============================================================
-- TENIS APP — Phase 1 Initial Schema
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================
-- ENUM TYPES
-- ============================================================
CREATE TYPE skill_level AS ENUM (
  'beginner',
  'intermediate',
  'advanced',
  'professional'
);

CREATE TYPE match_status AS ENUM (
  'pending',
  'accepted',
  'pending_confirmation',
  'completed',
  'cancelled',
  'disputed'
);

CREATE TYPE match_format AS ENUM (
  'best_of_1',
  'best_of_3',
  'best_of_5'
);

CREATE TYPE request_status AS ENUM (
  'pending',
  'accepted',
  'declined',
  'expired',
  'withdrawn'
);

-- ============================================================
-- PROFILES (extends auth.users 1:1)
-- ============================================================
CREATE TABLE public.profiles (
  id                UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username          TEXT UNIQUE NOT NULL,
  full_name         TEXT NOT NULL,
  avatar_url        TEXT,
  bio               TEXT,
  skill_level       skill_level NOT NULL DEFAULT 'intermediate',
  elo_rating        INTEGER NOT NULL DEFAULT 1200 CHECK (elo_rating >= 800 AND elo_rating <= 3000),
  elo_provisional   BOOLEAN NOT NULL DEFAULT TRUE,
  matches_played    INTEGER NOT NULL DEFAULT 0 CHECK (matches_played >= 0),
  matches_won       INTEGER NOT NULL DEFAULT 0 CHECK (matches_won >= 0),
  matches_lost      INTEGER NOT NULL DEFAULT 0 CHECK (matches_lost >= 0),
  city              TEXT,
  country           CHAR(2) NOT NULL DEFAULT 'US',
  latitude          DOUBLE PRECISION,
  longitude         DOUBLE PRECISION,
  preferred_surface TEXT[],
  is_public         BOOLEAN NOT NULL DEFAULT TRUE,
  is_active         BOOLEAN NOT NULL DEFAULT TRUE,
  last_active_at    TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for profile search
CREATE INDEX idx_profiles_elo ON public.profiles(elo_rating DESC) WHERE is_active = TRUE AND is_public = TRUE;
CREATE INDEX idx_profiles_username_gin ON public.profiles USING GIN (username gin_trgm_ops);
CREATE INDEX idx_profiles_name_gin ON public.profiles USING GIN (full_name gin_trgm_ops);
CREATE INDEX idx_profiles_skill ON public.profiles(skill_level) WHERE is_public = TRUE AND is_active = TRUE;
CREATE INDEX idx_profiles_location ON public.profiles(country, city) WHERE is_public = TRUE;

-- ============================================================
-- PLAYER AVAILABILITY
-- ============================================================
CREATE TABLE public.player_availability (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  day_of_week   SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time    TIME NOT NULL,
  end_time      TIME NOT NULL CHECK (end_time > start_time),
  is_recurring  BOOLEAN NOT NULL DEFAULT TRUE,
  valid_from    DATE,
  valid_until   DATE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_availability_player ON public.player_availability(player_id);
CREATE INDEX idx_availability_day ON public.player_availability(day_of_week, start_time);

-- ============================================================
-- MATCHES
-- ============================================================
CREATE TABLE public.matches (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player1_id          UUID NOT NULL REFERENCES public.profiles(id),
  player2_id          UUID NOT NULL REFERENCES public.profiles(id),
  status              match_status NOT NULL DEFAULT 'pending',
  format              match_format NOT NULL DEFAULT 'best_of_3',
  scheduled_at        TIMESTAMPTZ,
  played_at           TIMESTAMPTZ,
  location_name       TEXT,
  location_city       TEXT,
  location_lat        DOUBLE PRECISION,
  location_lng        DOUBLE PRECISION,
  player1_sets_won    SMALLINT,
  player2_sets_won    SMALLINT,
  score_detail        JSONB,
  winner_id           UUID REFERENCES public.profiles(id),
  loser_id            UUID REFERENCES public.profiles(id),
  player1_elo_before  INTEGER,
  player2_elo_before  INTEGER,
  player1_elo_after   INTEGER,
  player2_elo_after   INTEGER,
  player1_elo_delta   INTEGER,
  player2_elo_delta   INTEGER,
  result_submitted_by UUID REFERENCES public.profiles(id),
  result_confirmed_by UUID REFERENCES public.profiles(id),
  result_confirmed_at TIMESTAMPTZ,
  notes               TEXT,
  is_ranked           BOOLEAN NOT NULL DEFAULT TRUE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT different_players CHECK (player1_id <> player2_id),
  CONSTRAINT winner_is_participant CHECK (
    winner_id IS NULL OR winner_id IN (player1_id, player2_id)
  )
);

CREATE INDEX idx_matches_player1 ON public.matches(player1_id, status);
CREATE INDEX idx_matches_player2 ON public.matches(player2_id, status);
CREATE INDEX idx_matches_scheduled ON public.matches(scheduled_at DESC);
CREATE INDEX idx_matches_played ON public.matches(played_at DESC) WHERE status = 'completed';
CREATE INDEX idx_matches_status ON public.matches(status);

-- ============================================================
-- MATCH REQUESTS
-- ============================================================
CREATE TABLE public.match_requests (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  requester_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  recipient_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status          request_status NOT NULL DEFAULT 'pending',
  proposed_at     TIMESTAMPTZ NOT NULL,
  proposed_format match_format NOT NULL DEFAULT 'best_of_3',
  location_name   TEXT,
  location_city   TEXT,
  message         TEXT CHECK (char_length(message) <= 500),
  expires_at      TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '48 hours'),
  match_id        UUID REFERENCES public.matches(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT no_self_request CHECK (requester_id <> recipient_id)
);

CREATE INDEX idx_requests_requester ON public.match_requests(requester_id, status);
CREATE INDEX idx_requests_recipient ON public.match_requests(recipient_id, status);
CREATE INDEX idx_requests_pending ON public.match_requests(expires_at) WHERE status = 'pending';

-- ============================================================
-- ELO HISTORY (immutable audit trail)
-- ============================================================
CREATE TABLE public.elo_history (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  match_id      UUID REFERENCES public.matches(id) ON DELETE SET NULL,
  elo_before    INTEGER NOT NULL,
  elo_after     INTEGER NOT NULL,
  elo_delta     INTEGER NOT NULL,
  reason        TEXT NOT NULL DEFAULT 'match_result',
  provisional   BOOLEAN NOT NULL,
  recorded_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_elo_player ON public.elo_history(player_id, recorded_at DESC);
CREATE INDEX idx_elo_match ON public.elo_history(match_id);
CREATE INDEX idx_elo_recent ON public.elo_history(recorded_at DESC) WHERE reason = 'match_result';

-- ============================================================
-- LEADERBOARD VIEW
-- ============================================================
CREATE OR REPLACE VIEW public.leaderboard AS
SELECT
  p.id,
  p.username,
  p.full_name,
  p.avatar_url,
  p.elo_rating,
  p.elo_provisional,
  p.skill_level,
  p.matches_played,
  p.matches_won,
  p.matches_lost,
  p.city,
  p.country,
  RANK() OVER (ORDER BY p.elo_rating DESC) AS rank,
  RANK() OVER (PARTITION BY p.country ORDER BY p.elo_rating DESC) AS country_rank
FROM public.profiles p
WHERE
  p.is_active = TRUE
  AND p.is_public = TRUE
  AND p.matches_played >= 5;

-- ============================================================
-- FUNCTIONS
-- ============================================================

-- Auto-update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_username TEXT;
BEGIN
  v_username := COALESCE(
    NEW.raw_user_meta_data->>'username',
    'player_' || SUBSTR(REPLACE(NEW.id::TEXT, '-', ''), 1, 8)
  );

  -- Handle username conflicts
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = v_username) LOOP
    v_username := v_username || '_' || FLOOR(RANDOM() * 1000)::TEXT;
  END LOOP;

  INSERT INTO public.profiles (id, full_name, username)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Player'),
    v_username
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Process match result atomically (called by Edge Function)
CREATE OR REPLACE FUNCTION public.process_match_result(p_match_id UUID)
RETURNS void AS $$
DECLARE
  v_match RECORD;
  v_p1 RECORD;
  v_p2 RECORD;
  v_p1_sets INTEGER;
  v_p2_sets INTEGER;
  v_winner_id UUID;
  v_loser_id UUID;
  v_p1_k INTEGER;
  v_p2_k INTEGER;
  v_p1_expected FLOAT;
  v_p2_expected FLOAT;
  v_p1_new_elo INTEGER;
  v_p2_new_elo INTEGER;
  v_p1_delta INTEGER;
  v_p2_delta INTEGER;
  v_set JSONB;
BEGIN
  -- Fetch match
  SELECT * INTO v_match FROM public.matches WHERE id = p_match_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Match % not found', p_match_id;
  END IF;

  IF v_match.status != 'pending_confirmation' THEN
    RAISE EXCEPTION 'Match % is not in pending_confirmation status', p_match_id;
  END IF;

  -- Fetch both player profiles
  SELECT elo_rating, matches_played, elo_provisional
  INTO v_p1
  FROM public.profiles WHERE id = v_match.player1_id;

  SELECT elo_rating, matches_played, elo_provisional
  INTO v_p2
  FROM public.profiles WHERE id = v_match.player2_id;

  -- Determine winner from score_detail sets
  v_p1_sets := 0;
  v_p2_sets := 0;
  FOR v_set IN SELECT * FROM jsonb_array_elements(v_match.score_detail) LOOP
    IF (v_set->>'p1')::INT > (v_set->>'p2')::INT THEN
      v_p1_sets := v_p1_sets + 1;
    ELSE
      v_p2_sets := v_p2_sets + 1;
    END IF;
  END LOOP;

  IF v_p1_sets > v_p2_sets THEN
    v_winner_id := v_match.player1_id;
    v_loser_id := v_match.player2_id;
  ELSE
    v_winner_id := v_match.player2_id;
    v_loser_id := v_match.player1_id;
  END IF;

  -- Calculate K-factors
  v_p1_k := CASE
    WHEN v_p1.matches_played < 10 THEN 40
    WHEN v_p1.matches_played < 30 THEN 32
    WHEN v_p1.elo_rating >= 2000 THEN 16
    ELSE 24
  END;

  v_p2_k := CASE
    WHEN v_p2.matches_played < 10 THEN 40
    WHEN v_p2.matches_played < 30 THEN 32
    WHEN v_p2.elo_rating >= 2000 THEN 16
    ELSE 24
  END;

  -- Expected scores
  v_p1_expected := 1.0 / (1.0 + POW(10.0, (v_p2.elo_rating - v_p1.elo_rating)::FLOAT / 400.0));
  v_p2_expected := 1.0 - v_p1_expected;

  -- New ELOs
  v_p1_new_elo := GREATEST(800, LEAST(3000,
    ROUND(v_p1.elo_rating + v_p1_k * (
      CASE WHEN v_winner_id = v_match.player1_id THEN 1.0 ELSE 0.0 END - v_p1_expected
    ))
  ));

  v_p2_new_elo := GREATEST(800, LEAST(3000,
    ROUND(v_p2.elo_rating + v_p2_k * (
      CASE WHEN v_winner_id = v_match.player2_id THEN 1.0 ELSE 0.0 END - v_p2_expected
    ))
  ));

  v_p1_delta := v_p1_new_elo - v_p1.elo_rating;
  v_p2_delta := v_p2_new_elo - v_p2.elo_rating;

  -- Update player 1
  UPDATE public.profiles SET
    elo_rating = v_p1_new_elo,
    matches_played = matches_played + 1,
    matches_won = matches_won + CASE WHEN v_winner_id = player1_id THEN 1 ELSE 0 END,
    matches_lost = matches_lost + CASE WHEN v_loser_id = player1_id THEN 1 ELSE 0 END,
    elo_provisional = (matches_played + 1) < 10,
    last_active_at = NOW()
  WHERE id = v_match.player1_id;

  -- Update player 2
  UPDATE public.profiles SET
    elo_rating = v_p2_new_elo,
    matches_played = matches_played + 1,
    matches_won = matches_won + CASE WHEN v_winner_id = player2_id THEN 1 ELSE 0 END,
    matches_lost = matches_lost + CASE WHEN v_loser_id = player2_id THEN 1 ELSE 0 END,
    elo_provisional = (matches_played + 1) < 10,
    last_active_at = NOW()
  WHERE id = v_match.player2_id;

  -- Update match record
  UPDATE public.matches SET
    status = 'completed',
    played_at = COALESCE(played_at, NOW()),
    winner_id = v_winner_id,
    loser_id = v_loser_id,
    player1_elo_before = v_p1.elo_rating,
    player2_elo_before = v_p2.elo_rating,
    player1_elo_after = v_p1_new_elo,
    player2_elo_after = v_p2_new_elo,
    player1_elo_delta = v_p1_delta,
    player2_elo_delta = v_p2_delta
  WHERE id = p_match_id;

  -- Insert ELO history for both players
  INSERT INTO public.elo_history (player_id, match_id, elo_before, elo_after, elo_delta, reason, provisional)
  VALUES
    (v_match.player1_id, p_match_id, v_p1.elo_rating, v_p1_new_elo, v_p1_delta, 'match_result', v_p1.elo_provisional),
    (v_match.player2_id, p_match_id, v_p2.elo_rating, v_p2_new_elo, v_p2_delta, 'match_result', v_p2.elo_provisional);

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Expire pending match requests
CREATE OR REPLACE FUNCTION public.expire_match_requests()
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE public.match_requests
  SET status = 'expired'
  WHERE status = 'pending' AND expires_at < NOW();

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- TRIGGERS
-- ============================================================

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER matches_updated_at
  BEFORE UPDATE ON public.matches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER match_requests_updated_at
  BEFORE UPDATE ON public.match_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('avatars', 'avatars', TRUE, 5242880, ARRAY['image/jpeg','image/png','image/webp']),
  ('match-evidence', 'match-evidence', FALSE, 10485760, ARRAY['image/jpeg','image/png','image/webp'])
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.elo_history ENABLE ROW LEVEL SECURITY;

-- PROFILES
CREATE POLICY "Read public profiles"
  ON public.profiles FOR SELECT TO authenticated
  USING (is_public = TRUE OR id = auth.uid());

CREATE POLICY "Update own profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid()) WITH CHECK (id = auth.uid());

CREATE POLICY "Service role inserts profiles"
  ON public.profiles FOR INSERT TO service_role WITH CHECK (TRUE);

-- PLAYER AVAILABILITY
CREATE POLICY "Read availability for public players"
  ON public.player_availability FOR SELECT TO authenticated
  USING (
    player_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = player_availability.player_id AND is_public = TRUE
    )
  );

CREATE POLICY "Manage own availability"
  ON public.player_availability FOR ALL TO authenticated
  USING (player_id = auth.uid()) WITH CHECK (player_id = auth.uid());

-- MATCHES
CREATE POLICY "Participants see their matches"
  ON public.matches FOR SELECT TO authenticated
  USING (player1_id = auth.uid() OR player2_id = auth.uid());

CREATE POLICY "Participants update their matches"
  ON public.matches FOR UPDATE TO authenticated
  USING (player1_id = auth.uid() OR player2_id = auth.uid());

CREATE POLICY "Service role inserts matches"
  ON public.matches FOR INSERT TO service_role WITH CHECK (TRUE);

CREATE POLICY "Service role updates matches"
  ON public.matches FOR UPDATE TO service_role USING (TRUE);

-- MATCH REQUESTS
CREATE POLICY "Participants see their requests"
  ON public.match_requests FOR SELECT TO authenticated
  USING (requester_id = auth.uid() OR recipient_id = auth.uid());

CREATE POLICY "Requester creates request"
  ON public.match_requests FOR INSERT TO authenticated
  WITH CHECK (requester_id = auth.uid());

CREATE POLICY "Participants update requests"
  ON public.match_requests FOR UPDATE TO authenticated
  USING (requester_id = auth.uid() OR recipient_id = auth.uid());

-- ELO HISTORY
CREATE POLICY "Authenticated users read elo history"
  ON public.elo_history FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "Service role inserts elo history"
  ON public.elo_history FOR INSERT TO service_role WITH CHECK (TRUE);

-- STORAGE POLICIES
CREATE POLICY "Avatars are public"
  ON storage.objects FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users upload own avatar"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND name LIKE auth.uid()::TEXT || '/%');

CREATE POLICY "Users update own avatar"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars' AND name LIKE auth.uid()::TEXT || '/%');
