BEGIN;

-- Personas globais são capacidades; vínculos com escolas continuam em
-- organization_memberships para permitir uma pessoa em várias instituições.
CREATE TABLE IF NOT EXISTS user_personas (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  persona TEXT NOT NULL CHECK (persona IN (
    'reader','educator','school_admin','commercial_partner',
    'cultural_partner','owner','developer'
  )),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','pending','revoked')),
  verified_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id,persona)
);
CREATE INDEX IF NOT EXISTS idx_user_personas_persona_status ON user_personas(persona,status);

-- Contexto preferido é só navegação; nunca concede permissão.
CREATE TABLE IF NOT EXISTS user_context_preferences (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  context_kind TEXT NOT NULL DEFAULT 'reader' CHECK (context_kind IN ('reader','education','commercial','cultural','operation')),
  organization_id TEXT REFERENCES organizations(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Escopo de parceiro comercial: somente registros explicitamente atribuídos.
CREATE TABLE IF NOT EXISTS commercial_partner_assignments (
  partner_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  organization_id TEXT REFERENCES organizations(id) ON DELETE CASCADE,
  lead_id TEXT REFERENCES partner_leads(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK ((organization_id IS NOT NULL)::int + (lead_id IS NOT NULL)::int = 1),
  UNIQUE (partner_user_id,organization_id),
  UNIQUE (partner_user_id,lead_id)
);
CREATE INDEX IF NOT EXISTS idx_commercial_partner_user ON commercial_partner_assignments(partner_user_id);

-- Curadoria por obra: comentar, aprovar e publicar são permissões independentes.
CREATE TABLE IF NOT EXISTS curator_work_permissions (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  work_slug TEXT NOT NULL,
  can_comment BOOLEAN NOT NULL DEFAULT TRUE,
  can_approve BOOLEAN NOT NULL DEFAULT FALSE,
  can_publish BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id,work_slug)
);

CREATE TABLE IF NOT EXISTS curator_scene_comments (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  work_slug TEXT NOT NULL,
  scene_id TEXT NOT NULL,
  body TEXT NOT NULL CHECK (char_length(body) BETWEEN 1 AND 4000),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','resolved')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_curator_comments_work_scene ON curator_scene_comments(work_slug,scene_id,created_at DESC);

-- Backfill conservador. Não troca o login atual nem amplia permissões de produção.
INSERT INTO user_personas(user_id,persona,status,verified_at)
SELECT id,'reader','active',NOW() FROM users
ON CONFLICT DO NOTHING;

INSERT INTO user_personas(user_id,persona,status,verified_at)
SELECT user_id,'educator','active',NOW() FROM teacher_profiles
ON CONFLICT DO NOTHING;

INSERT INTO user_personas(user_id,persona,status,verified_at)
SELECT user_id,
  CASE role WHEN 'manager' THEN 'school_admin' WHEN 'teacher' THEN 'educator' ELSE 'reader' END,
  'active',NOW()
FROM organization_memberships
ON CONFLICT DO NOTHING;

-- Compatibilidade: administradores já existentes continuam owners até revisão manual.
INSERT INTO user_personas(user_id,persona,status,verified_at)
SELECT id,'owner','active',NOW() FROM users WHERE role='admin'
ON CONFLICT DO NOTHING;

COMMIT;
