-- Tournaments & Meetups tables

CREATE TABLE public.tournaments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  location_city TEXT,
  location_name TEXT,
  scheduled_at TIMESTAMPTZ NOT NULL,
  max_spots INT NOT NULL DEFAULT 8,
  format TEXT NOT NULL DEFAULT 'singles' CHECK (format IN ('singles', 'doubles', 'both')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'full', 'cancelled', 'completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.tournament_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  play_format TEXT NOT NULL CHECK (play_format IN ('singles', 'doubles')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tournament_id, player_id)
);

-- Indexes
CREATE INDEX idx_tournaments_status ON public.tournaments(status);
CREATE INDEX idx_tournaments_scheduled_at ON public.tournaments(scheduled_at);
CREATE INDEX idx_tournaments_creator_id ON public.tournaments(creator_id);
CREATE INDEX idx_tournament_participants_tournament_id ON public.tournament_participants(tournament_id);
CREATE INDEX idx_tournament_participants_player_id ON public.tournament_participants(player_id);

-- Enable RLS
ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_participants ENABLE ROW LEVEL SECURITY;

-- RLS policies: tournaments
CREATE POLICY "Authenticated users can read tournaments"
  ON public.tournaments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create tournaments"
  ON public.tournaments FOR INSERT
  TO authenticated
  WITH CHECK (creator_id = auth.uid());

CREATE POLICY "Creators can update their own tournament"
  ON public.tournaments FOR UPDATE
  TO authenticated
  USING (creator_id = auth.uid());

-- RLS policies: tournament_participants
CREATE POLICY "Authenticated users can read participants"
  ON public.tournament_participants FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can join tournaments"
  ON public.tournament_participants FOR INSERT
  TO authenticated
  WITH CHECK (player_id = auth.uid());

CREATE POLICY "Players can leave tournaments"
  ON public.tournament_participants FOR DELETE
  TO authenticated
  USING (player_id = auth.uid());
