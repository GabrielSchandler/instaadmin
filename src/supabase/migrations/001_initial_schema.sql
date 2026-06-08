-- ============================================================
-- AUTO CAROUSEL AI PRO — Initial Schema
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PROFILES
-- ============================================================
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT,
  avatar_url  TEXT,
  plan        TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- INSTAGRAM ACCOUNTS
-- ============================================================
CREATE TABLE instagram_accounts (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  ig_user_id        TEXT NOT NULL UNIQUE,
  username          TEXT NOT NULL,
  access_token      TEXT NOT NULL,
  token_expires_at  TIMESTAMPTZ,
  is_active         BOOLEAN NOT NULL DEFAULT TRUE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE instagram_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own IG accounts"
  ON instagram_accounts FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- TEMPLATES (seed data — no RLS needed)
-- ============================================================
CREATE TABLE templates (
  id               TEXT PRIMARY KEY,
  name             TEXT NOT NULL,
  description      TEXT,
  preview_url      TEXT,
  primary_color    TEXT NOT NULL,
  secondary_color  TEXT NOT NULL,
  accent_color     TEXT,
  font_family      TEXT NOT NULL DEFAULT 'Inter',
  layout_type      TEXT NOT NULL CHECK (layout_type IN ('split', 'centered', 'sidebar', 'overlay', 'minimal')),
  tags             TEXT[] DEFAULT '{}',
  is_active        BOOLEAN NOT NULL DEFAULT TRUE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO templates (id, name, description, primary_color, secondary_color, accent_color, font_family, layout_type, tags) VALUES
  ('premium-black',   'Premium Black',     'Elegante, impactante. Ideal para luxury e premium.',        '#0A0A0A', '#FFFFFF', '#FF3B30', 'Inter',       'split',    ARRAY['luxury','premium','dark','business']),
  ('corporate-blue',  'Corporate Blue',    'Profissional e confiável. Ideal para negócios e finanças.', '#1E3A8A', '#FFFFFF', '#3B82F6', 'Inter',       'centered', ARRAY['corporate','finance','professional','blue']),
  ('minimal-clean',   'Minimal Clean',     'Limpo e minimalista. Ideal para design e lifestyle.',       '#FFFFFF', '#1A1A1A', '#6366F1', 'Inter',       'minimal',  ARRAY['minimal','clean','lifestyle','design']),
  ('modern-gradient', 'Modern Gradient',   'Vibrante e moderno. Ideal para marketing e tecnologia.',    '#667EEA', '#764BA2', '#F093FB', 'Poppins',     'overlay',  ARRAY['modern','gradient','marketing','tech']),
  ('dark-premium',    'Dark Premium',      'Premium escuro. Ideal para empreendedorismo e negócios.',   '#111827', '#F9FAFB', '#F59E0B', 'Playfair Display', 'sidebar', ARRAY['dark','premium','entrepreneur','business']);

-- ============================================================
-- CAROUSEL POSTS
-- ============================================================
CREATE TABLE carousel_posts (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id            UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title              TEXT NOT NULL,
  caption            TEXT,
  hashtags           TEXT[] DEFAULT '{}',
  template_id        TEXT REFERENCES templates(id),
  status             TEXT NOT NULL DEFAULT 'draft' CHECK (
    status IN ('draft','pending','scheduled','published','failed','cancelled')
  ),
  generation_prompt  TEXT,
  ai_metadata        JSONB DEFAULT '{}',
  scheduled_at       TIMESTAMPTZ,
  published_at       TIMESTAMPTZ,
  ig_media_id        TEXT,
  ig_permalink       TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE carousel_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own posts"
  ON carousel_posts FOR ALL USING (auth.uid() = user_id);

CREATE INDEX idx_carousel_posts_user_status ON carousel_posts(user_id, status);
CREATE INDEX idx_carousel_posts_scheduled ON carousel_posts(scheduled_at) WHERE status = 'scheduled';

-- ============================================================
-- CAROUSEL SLIDES
-- ============================================================
CREATE TABLE carousel_slides (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id        UUID NOT NULL REFERENCES carousel_posts(id) ON DELETE CASCADE,
  position       INTEGER NOT NULL CHECK (position BETWEEN 1 AND 10),
  slide_type     TEXT NOT NULL CHECK (slide_type IN ('cover','content','cta')),
  headline       TEXT,
  subheadline    TEXT,
  body           TEXT,
  cta_text       TEXT,
  image_url      TEXT,
  render_config  JSONB DEFAULT '{}',
  rendered_at    TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(post_id, position)
);

ALTER TABLE carousel_slides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage slides of own posts"
  ON carousel_slides FOR ALL USING (
    EXISTS (
      SELECT 1 FROM carousel_posts
      WHERE carousel_posts.id = carousel_slides.post_id
        AND carousel_posts.user_id = auth.uid()
    )
  );

CREATE INDEX idx_carousel_slides_post ON carousel_slides(post_id, position);

-- ============================================================
-- MEDIA ASSETS
-- ============================================================
CREATE TABLE media_assets (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  filename      TEXT NOT NULL,
  original_url  TEXT NOT NULL,
  cdn_url       TEXT NOT NULL,
  mime_type     TEXT NOT NULL,
  size_bytes    INTEGER NOT NULL DEFAULT 0,
  width         INTEGER,
  height        INTEGER,
  tags          TEXT[] DEFAULT '{}',
  collection    TEXT,
  source        TEXT NOT NULL DEFAULT 'upload' CHECK (source IN ('upload','generated','unsplash')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE media_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own media"
  ON media_assets FOR ALL USING (auth.uid() = user_id);

CREATE INDEX idx_media_assets_user ON media_assets(user_id, created_at DESC);

-- ============================================================
-- SCHEDULED POSTS (publication queue)
-- ============================================================
CREATE TABLE scheduled_posts (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id               UUID NOT NULL REFERENCES carousel_posts(id) ON DELETE CASCADE,
  instagram_account_id  UUID NOT NULL REFERENCES instagram_accounts(id) ON DELETE CASCADE,
  scheduled_at          TIMESTAMPTZ NOT NULL,
  status                TEXT NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending','processing','done','failed')
  ),
  attempts              INTEGER NOT NULL DEFAULT 0,
  last_attempt_at       TIMESTAMPTZ,
  error_message         TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE scheduled_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own scheduled posts"
  ON scheduled_posts FOR ALL USING (
    EXISTS (
      SELECT 1 FROM carousel_posts
      WHERE carousel_posts.id = scheduled_posts.post_id
        AND carousel_posts.user_id = auth.uid()
    )
  );

CREATE INDEX idx_scheduled_posts_due ON scheduled_posts(scheduled_at, status)
  WHERE status = 'pending';

-- ============================================================
-- GENERATION LOGS
-- ============================================================
CREATE TABLE generation_logs (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  post_id           UUID REFERENCES carousel_posts(id) ON DELETE SET NULL,
  operation         TEXT NOT NULL CHECK (operation IN ('content','template_select','render','publish')),
  model             TEXT,
  prompt_tokens     INTEGER,
  completion_tokens INTEGER,
  duration_ms       INTEGER,
  status            TEXT NOT NULL CHECK (status IN ('success','error')),
  error             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE generation_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own logs"
  ON generation_logs FOR SELECT USING (auth.uid() = user_id);

CREATE INDEX idx_generation_logs_user ON generation_logs(user_id, created_at DESC);

-- ============================================================
-- AUDIT LOGS
-- ============================================================
CREATE TABLE audit_logs (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action     TEXT NOT NULL,
  entity     TEXT NOT NULL,
  entity_id  UUID,
  metadata   JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own audit logs"
  ON audit_logs FOR SELECT USING (auth.uid() = user_id);

CREATE INDEX idx_audit_logs_user ON audit_logs(user_id, created_at DESC);

-- ============================================================
-- SETTINGS
-- ============================================================
CREATE TABLE settings (
  user_id              UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  default_template_id  TEXT REFERENCES templates(id),
  default_timezone     TEXT NOT NULL DEFAULT 'America/Sao_Paulo',
  ig_account_id        UUID REFERENCES instagram_accounts(id) ON DELETE SET NULL,
  ai_tone              TEXT NOT NULL DEFAULT 'professional',
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own settings"
  ON settings FOR ALL USING (auth.uid() = user_id);

-- Auto-create settings row on profile creation
CREATE OR REPLACE FUNCTION handle_new_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO settings (user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_profile_created
  AFTER INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION handle_new_profile();

-- ============================================================
-- UPDATED_AT triggers
-- ============================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_instagram_accounts_updated_at
  BEFORE UPDATE ON instagram_accounts
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_carousel_posts_updated_at
  BEFORE UPDATE ON carousel_posts
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
