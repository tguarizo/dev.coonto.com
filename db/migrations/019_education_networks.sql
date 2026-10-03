BEGIN;
CREATE TABLE IF NOT EXISTS education_networks (
 id TEXT PRIMARY KEY, name TEXT NOT NULL CHECK(char_length(name) BETWEEN 2 AND 200),
 status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','paused')), created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS education_network_memberships (
 network_id TEXT NOT NULL REFERENCES education_networks(id),user_id TEXT NOT NULL REFERENCES users(id),
 can_manage_licenses BOOLEAN NOT NULL DEFAULT FALSE,can_view_reports BOOLEAN NOT NULL DEFAULT FALSE,
 can_drilldown BOOLEAN NOT NULL DEFAULT FALSE,
 status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','revoked')),
 valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),valid_until TIMESTAMPTZ,
 PRIMARY KEY(network_id,user_id), CHECK(NOT can_drilldown OR can_view_reports)
);
CREATE TABLE IF NOT EXISTS education_network_schools (
 network_id TEXT NOT NULL REFERENCES education_networks(id),organization_id TEXT NOT NULL REFERENCES organizations(id),
 can_allocate_licenses BOOLEAN NOT NULL DEFAULT FALSE,can_share_reports BOOLEAN NOT NULL DEFAULT FALSE,
 status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','revoked')),
 valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),valid_until TIMESTAMPTZ,
 PRIMARY KEY(network_id,organization_id)
);
CREATE TABLE IF NOT EXISTS education_license_contracts (
 id TEXT PRIMARY KEY,network_id TEXT NOT NULL REFERENCES education_networks(id),work_slug TEXT NOT NULL,
 reference TEXT NOT NULL CHECK(char_length(reference) BETWEEN 2 AND 160),
 seats INTEGER NOT NULL CHECK(seats BETWEEN 1 AND 1000000),
 status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','revoked')),
 valid_from TIMESTAMPTZ NOT NULL,valid_until TIMESTAMPTZ NOT NULL,CHECK(valid_until>valid_from),
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS education_license_allocations (
 contract_id TEXT NOT NULL REFERENCES education_license_contracts(id),organization_id TEXT NOT NULL REFERENCES organizations(id),
 seats INTEGER NOT NULL CHECK(seats BETWEEN 0 AND 1000000),updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 PRIMARY KEY(contract_id,organization_id)
);
CREATE TABLE IF NOT EXISTS education_license_grants (
 id TEXT PRIMARY KEY,contract_id TEXT NOT NULL,organization_id TEXT NOT NULL,user_id TEXT NOT NULL REFERENCES users(id),
 status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','revoked')),
 activated_at TIMESTAMPTZ,used_at TIMESTAMPTZ,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 UNIQUE(contract_id,user_id),
 FOREIGN KEY(contract_id,organization_id) REFERENCES education_license_allocations(contract_id,organization_id),
 FOREIGN KEY(organization_id,user_id) REFERENCES organization_memberships(organization_id,user_id)
);
CREATE INDEX IF NOT EXISTS idx_education_grants_user ON education_license_grants(user_id,status);
CREATE INDEX IF NOT EXISTS idx_education_grants_school ON education_license_grants(contract_id,organization_id,status);
COMMIT;
