-- ProspectAI — schéma PostgreSQL / Supabase
-- À exécuter dans l'éditeur SQL du projet Supabase.
-- Le backend Python doit utiliser la clé service_role (contourne le RLS).

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---------------------------------------------------------------------------
-- campaigns
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    name TEXT NOT NULL,
    target_type TEXT,
    sector TEXT,
    location TEXT,
    keywords_include TEXT[] DEFAULT '{}',
    keywords_exclude TEXT[] DEFAULT '{}',
    size_criteria TEXT,
    commercial_signal TEXT,
    nb_prospects_target INTEGER DEFAULT 10,
    score_threshold INTEGER DEFAULT 7,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- prospects
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS prospects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    prospect_id TEXT UNIQUE NOT NULL,
    company_name TEXT,
    domain TEXT,
    website_url TEXT,
    sector TEXT,
    sub_sector TEXT,
    location TEXT,
    phone TEXT,
    email TEXT,
    employee_count INTEGER,
    size_category TEXT,
    revenue TEXT,
    revenue_status TEXT,
    founded_year INTEGER,
    experience_years INTEGER,
    products_services TEXT,
    description TEXT,
    rating DOUBLE PRECISION,
    review_count INTEGER,
    digital_presence TEXT,
    commercial_signals TEXT[] DEFAULT '{}',
    sources JSONB DEFAULT '{}'::jsonb,
    ai_score INTEGER DEFAULT 0 CHECK (ai_score >= 0 AND ai_score <= 10),
    ai_justification TEXT,
    ai_positive_signals TEXT[] DEFAULT '{}',
    ai_negative_signals TEXT[] DEFAULT '{}',
    ai_missing_data TEXT[] DEFAULT '{}',
    status TEXT DEFAULT 'À qualifier' CHECK (
        status IN (
            'À qualifier',
            'Qualifié',
            'Rejeté',
            'À valider',
            'Contacté',
            'Relancé',
            'Répondu',
            'Converti',
            'Perdu',
            'Classé',
            'À relancer plus tard'
        )
    ),
    contact_date TIMESTAMPTZ,
    followup_count INTEGER DEFAULT 0 CHECK (followup_count >= 0),
    next_followup_date TIMESTAMPTZ,
    last_action_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- interactions
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prospect_id UUID REFERENCES prospects(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (
        type IN ('email_sent', 'email_received', 'followup_sent', 'status_change')
    ),
    content TEXT,
    ai_analysis JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_campaigns_user_id ON campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_prospects_campaign_id ON prospects(campaign_id);
CREATE INDEX IF NOT EXISTS idx_prospects_status ON prospects(status);
CREATE INDEX IF NOT EXISTS idx_prospects_ai_score ON prospects(ai_score);
CREATE INDEX IF NOT EXISTS idx_prospects_prospect_id ON prospects(prospect_id);
CREATE INDEX IF NOT EXISTS idx_prospects_email ON prospects(email);
CREATE INDEX IF NOT EXISTS idx_prospects_next_followup ON prospects(next_followup_date);
CREATE INDEX IF NOT EXISTS idx_interactions_prospect_id ON interactions(prospect_id);
CREATE INDEX IF NOT EXISTS idx_interactions_type ON interactions(type);
CREATE INDEX IF NOT EXISTS idx_interactions_created_at ON interactions(created_at);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_prospects_updated_at ON prospects;
CREATE TRIGGER trg_prospects_updated_at
    BEFORE UPDATE ON prospects
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------------
-- RLS — préparation multi-utilisateur
-- Le rôle service_role (clé backend) contourne ces politiques.
-- Les rôles anon / authenticated ne voient que les campagnes de auth.uid().
-- ---------------------------------------------------------------------------
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE prospects ENABLE ROW LEVEL SECURITY;
ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS campaigns_select_own ON campaigns;
DROP POLICY IF EXISTS campaigns_insert_own ON campaigns;
DROP POLICY IF EXISTS campaigns_update_own ON campaigns;
DROP POLICY IF EXISTS campaigns_delete_own ON campaigns;
DROP POLICY IF EXISTS prospects_select_own ON prospects;
DROP POLICY IF EXISTS prospects_insert_own ON prospects;
DROP POLICY IF EXISTS prospects_update_own ON prospects;
DROP POLICY IF EXISTS prospects_delete_own ON prospects;
DROP POLICY IF EXISTS interactions_select_own ON interactions;
DROP POLICY IF EXISTS interactions_insert_own ON interactions;

CREATE POLICY campaigns_select_own ON campaigns
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY campaigns_insert_own ON campaigns
    FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY campaigns_update_own ON campaigns
    FOR UPDATE TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY campaigns_delete_own ON campaigns
    FOR DELETE TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY prospects_select_own ON prospects
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM campaigns
            WHERE campaigns.id = prospects.campaign_id
              AND campaigns.user_id = auth.uid()
        )
    );

CREATE POLICY prospects_insert_own ON prospects
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM campaigns
            WHERE campaigns.id = prospects.campaign_id
              AND campaigns.user_id = auth.uid()
        )
    );

CREATE POLICY prospects_update_own ON prospects
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM campaigns
            WHERE campaigns.id = prospects.campaign_id
              AND campaigns.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM campaigns
            WHERE campaigns.id = prospects.campaign_id
              AND campaigns.user_id = auth.uid()
        )
    );

CREATE POLICY prospects_delete_own ON prospects
    FOR DELETE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM campaigns
            WHERE campaigns.id = prospects.campaign_id
              AND campaigns.user_id = auth.uid()
        )
    );

CREATE POLICY interactions_select_own ON interactions
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM prospects
            JOIN campaigns ON prospects.campaign_id = campaigns.id
            WHERE prospects.id = interactions.prospect_id
              AND campaigns.user_id = auth.uid()
        )
    );

CREATE POLICY interactions_insert_own ON interactions
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM prospects
            JOIN campaigns ON prospects.campaign_id = campaigns.id
            WHERE prospects.id = interactions.prospect_id
              AND campaigns.user_id = auth.uid()
        )
    );
