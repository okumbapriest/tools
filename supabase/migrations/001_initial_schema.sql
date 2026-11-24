-- TOOLROOM Database Schema
-- Construction Tool Management & Accountability System
-- v1.0.0

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ROLES
-- ============================================================
CREATE TABLE roles (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          VARCHAR(50) UNIQUE NOT NULL,  -- 'admin' | 'storekeeper'
  description   TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO roles (name, description) VALUES
  ('admin',     'System administrator — appoints storekeepers, monitors inventory and accountability'),
  ('storekeeper', 'Physical store operator — registers workers, issues tools, records returns');

-- ============================================================
-- USERS (Authentication + profile)
-- ============================================================
CREATE TABLE users (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email          VARCHAR(255) UNIQUE NOT NULL,
  password_hash  TEXT NOT NULL,
  full_name      VARCHAR(200),
  avatar_url     TEXT,
  phone_number   VARCHAR(30),
  is_active      BOOLEAN NOT NULL DEFAULT true,
  last_login     TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- USER_ROLES (Many-to-many: users ↔ roles)
-- ============================================================
CREATE TABLE user_roles (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id        UUID NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
  appointed_by   UUID REFERENCES users(id),
  appointed_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  status         VARCHAR(20) NOT NULL DEFAULT 'active',  -- 'active' | 'removed'
  UNIQUE(user_id, role_id)
);

-- ============================================================
-- SITES (Construction sites)
-- ============================================================
CREATE TABLE sites (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name           VARCHAR(200) NOT NULL,
  location       VARCHAR(300),
  project_code   VARCHAR(50),
  is_active      BOOLEAN NOT NULL DEFAULT true,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- CATEGORIES
-- ============================================================
CREATE TABLE categories (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          VARCHAR(100) NOT NULL,
  description   TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- WORKERS
-- ============================================================
CREATE TABLE workers (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  worker_id        VARCHAR(20) UNIQUE NOT NULL,  -- WR-001, WR-002
  full_name        VARCHAR(200) NOT NULL,
  phone_number     VARCHAR(30),
  trade            VARCHAR(100),                  -- occupation
  assigned_site_id UUID REFERENCES sites(id),
  supervisor       VARCHAR(200),
  status           VARCHAR(20) NOT NULL DEFAULT 'active',
  notes            TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- TOOLS
-- ============================================================
CREATE TABLE tools (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tool_name               VARCHAR(200) NOT NULL,
  asset_code              VARCHAR(50) UNIQUE,
  category_id             UUID REFERENCES categories(id),
  total_quantity          INT NOT NULL DEFAULT 0 CHECK (total_quantity >= 0),
  available_quantity      INT NOT NULL DEFAULT 0 CHECK (available_quantity >= 0),
  issued_quantity         INT NOT NULL DEFAULT 0 CHECK (issued_quantity >= 0),
  damaged_quantity        INT NOT NULL DEFAULT 0 CHECK (damaged_quantity >= 0),
  under_repair_quantity   INT NOT NULL DEFAULT 0 CHECK (under_repair_quantity >= 0),
  missing_quantity        INT NOT NULL DEFAULT 0 CHECK (missing_quantity >= 0),
  storage_location        VARCHAR(200),
  condition               VARCHAR(30) NOT NULL DEFAULT 'good',
  minimum_stock           INT NOT NULL DEFAULT 5 CHECK (minimum_stock >= 0),
  description             TEXT,
  photo_url               TEXT,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- ISSUES (Tool issuance transactions)
-- ============================================================
CREATE TABLE issues (
  id                       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reference                VARCHAR(30) UNIQUE NOT NULL,  -- ISSUE-001
  worker_id                UUID NOT NULL REFERENCES workers(id),
  storekeeper_id           UUID NOT NULL REFERENCES users(id),
  site_id                  UUID REFERENCES sites(id),
  work_area                VARCHAR(200),
  expected_return_date     DATE,
  purpose                  TEXT,
  status                   VARCHAR(30) NOT NULL DEFAULT 'issued',
  acknowledged_at          TIMESTAMPTZ,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE issue_items (
  id        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  issue_id  UUID NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
  tool_id   UUID NOT NULL REFERENCES tools(id),
  quantity  INT NOT NULL CHECK (quantity > 0)
);

-- ============================================================
-- RETURNS
-- ============================================================
CREATE TABLE returns (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reference      VARCHAR(30) UNIQUE NOT NULL,  -- RETURN-002
  issue_id       UUID NOT NULL REFERENCES issues(id),
  worker_id      UUID NOT NULL REFERENCES workers(id),
  storekeeper_id UUID NOT NULL REFERENCES users(id),
  returned_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes          TEXT,
  inspected_by   UUID REFERENCES users(id),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE return_items (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  return_id         UUID NOT NULL REFERENCES returns(id) ON DELETE CASCADE,
  tool_id           UUID NOT NULL REFERENCES tools(id),
  quantity_returned INT NOT NULL CHECK (quantity_returned > 0),
  condition         VARCHAR(30) NOT NULL,   -- good | damaged | needs_repair | incomplete
  inspection_notes  TEXT
);

-- ============================================================
-- TRANSFERS
-- ============================================================
CREATE TABLE transfers (
  id                            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reference                     VARCHAR(30) UNIQUE NOT NULL,  -- TRANSFER-004
  issue_item_id                 UUID REFERENCES issue_items(id),
  from_worker_id                UUID NOT NULL REFERENCES workers(id),
  to_worker_id                  UUID NOT NULL REFERENCES workers(id),
  site_id                       UUID REFERENCES sites(id),
  transfer_reason               TEXT,
  acknowledged_by_new_holder_at TIMESTAMPTZ,
  confirmed_by_storekeeper_at   TIMESTAMPTZ,
  created_at                    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- STOCK_MOVEMENTS (Immutable ledger)
-- ============================================================
CREATE TYPE movement_type AS ENUM (
  'registration', 'issue', 'return_good', 'return_damaged',
  'transfer_in', 'transfer_out', 'damage_report', 'repair_start',
  'repair_complete', 'adjustment', 'missing_report', 'retirement'
);

CREATE TABLE stock_movements (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tool_id        UUID NOT NULL REFERENCES tools(id),
  movement_type  movement_type NOT NULL,
  quantity_change INT NOT NULL,
  reference_type VARCHAR(30),   -- 'issue' | 'return' | 'transfer' | ...
  reference_id   UUID,
  reason         TEXT,
  performed_by   UUID REFERENCES users(id),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_stock_movements_tool_id ON stock_movements(tool_id);
CREATE INDEX idx_stock_movements_created_at ON stock_movements(created_at DESC);

-- ============================================================
-- DAMAGE_RECORDS
-- ============================================================
CREATE TYPE damage_status AS ENUM ('reported', 'inspected', 'under_repair', 'written_off', 'resolved');

CREATE TABLE damage_records (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tool_id            UUID NOT NULL REFERENCES tools(id),
  reported_by        UUID NOT NULL REFERENCES users(id),
  worker_id          UUID REFERENCES workers(id),
  site_id            UUID REFERENCES sites(id),
  reported_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  damage_description TEXT,
  evidence_photo_url TEXT,
  action_taken       TEXT,
  status             damage_status NOT NULL DEFAULT 'reported',
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- REPAIRS
-- ============================================================
CREATE TYPE repair_status AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');

CREATE TABLE repairs (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  damage_record_id UUID REFERENCES damage_records(id),
  tool_id         UUID NOT NULL REFERENCES tools(id),
  issue_type      VARCHAR(200),
  status          repair_status NOT NULL DEFAULT 'pending',
  reported_by     UUID NOT NULL REFERENCES users(id),
  started_at      TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ,
  cost_estimate   DECIMAL(10, 2),
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- ACTIVITY_LOGS (Audit trail — append only)
-- ============================================================
CREATE TYPE activity_action AS ENUM (
  'tool_issued', 'tool_returned', 'worker_registered', 'tool_added',
  'storekeeper_changed', 'report_downloaded', 'tool_transferred',
  'damage_reported', 'repair_started', 'repair_completed', 'tool_edited',
  'login', 'logout', 'stock_adjusted'
);

CREATE TABLE activity_logs (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  action       activity_action NOT NULL,
  user_id      UUID REFERENCES users(id),
  target_table VARCHAR(50),
  target_id    UUID,
  details      JSONB,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at DESC);
CREATE INDEX idx_activity_logs_action ON activity_logs(action);

-- ============================================================
-- REPORT_RECORDS (Track report generation for audit)
-- ============================================================
CREATE TABLE report_records (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  generated_by UUID REFERENCES users(id),
  report_type  VARCHAR(100) NOT NULL,
  period_start DATE,
  period_end   DATE,
  format       VARCHAR(10) NOT NULL,  -- pdf | xlsx | csv
  file_url     TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- FUNCTIONS
-- ============================================================

-- Auto-generate issue/return/transfer references
CREATE OR REPLACE FUNCTION generate_reference(
  prefix VARCHAR,
  suffix_len INT DEFAULT 3
) RETURNS TEXT AS $$
BEGIN
  RETURN prefix || '-' || LPAD(
    EXTRACT(EPOCH FROM now())::BIGINT::TEXT,
    suffix_len, '0'
  );
END;
$$ LANGUAGE plpgsql;

-- Compute tool stock totals (trigger-based reconciliation)
CREATE OR REPLACE FUNCTION reconcile_tool_stock()
RETURNS TRIGGER AS $$
DECLARE
  v_tool_id UUID;
BEGIN
  IF TG_OP = 'INSERT' AND TG_TABLE_NAME = 'issue_items' THEN
    v_tool_id := NEW.tool_id;
  ELSIF TG_OP = 'DELETE' AND TG_TABLE_NAME = 'issue_items' THEN
    v_tool_id := OLD.tool_id;
  ELSIF TG_OP = 'INSERT' AND TG_TABLE_NAME = 'return_items' THEN
    v_tool_id := NEW.tool_id;
  ELSIF TG_OP = 'DELETE' AND TG_TABLE_NAME = 'return_items' THEN
    v_tool_id := OLD.tool_id;
  ELSE
    RETURN NULL;
  END IF;

  UPDATE tools SET
    issued_quantity = COALESCE((SELECT SUM(ii.quantity) FROM issue_items ii JOIN issues i ON i.id = ii.issue_id WHERE ii.tool_id = tools.id AND i.status = 'issued'), 0),
    updated_at = now()
  WHERE id = v_tool_id;

  -- Re-run availability calc (see trigger below)
  PERFORM calculate_tool_availability(v_tool_id);
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION calculate_tool_availability(p_tool_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE tools SET
    available_quantity = total_quantity - issued_quantity - damaged_quantity - under_repair_quantity - missing_quantity,
    updated_at = now()
  WHERE id = p_tool_id;
END;
$$ LANGUAGE plpgsql;

-- Log activity on key events
CREATE OR REPLACE FUNCTION log_activity()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO activity_logs (action, user_id, target_table, target_id, details)
  VALUES (
    TG_ARGV[0]::activity_action,
    CURRENT_USER::UUID,
    TG_TABLE_NAME,
    NEW.id,
    to_jsonb(NEW)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- TRIGGERS
-- ============================================================

CREATE TRIGGER trg_issue_items_after_insert
  AFTER INSERT ON issue_items
  FOR EACH ROW EXECUTE FUNCTION reconcile_tool_stock();

CREATE TRIGGER trg_issue_items_after_delete
  AFTER DELETE ON issue_items
  FOR EACH ROW EXECUTE FUNCTION reconcile_tool_stock();

CREATE TRIGGER trg_return_items_after_insert
  AFTER INSERT ON return_items
  FOR EACH ROW EXECUTE FUNCTION reconcile_tool_stock();

CREATE TRIGGER trg_returns_log_activity
  AFTER INSERT ON returns
  FOR EACH ROW EXECUTE FUNCTION log_activity('tool_returned');

CREATE TRIGGER trg_issues_log_activity
  AFTER INSERT ON issues
  FOR EACH ROW EXECUTE FUNCTION log_activity('tool_issued');

CREATE TRIGGER trg_workers_log_activity
  AFTER INSERT ON workers
  FOR EACH ROW EXECUTE FUNCTION log_activity('worker_registered');

CREATE TRIGGER trg_tools_log_activity
  AFTER INSERT ON tools
  FOR EACH ROW EXECUTE FUNCTION log_activity('tool_added');

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE issue_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE return_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE damage_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE repairs ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_records ENABLE ROW LEVEL SECURITY;

-- Admin: full access to everything
CREATE POLICY admin_all_access ON users FOR ALL USING (auth.uid() IN (SELECT ur.user_id FROM user_roles ur JOIN roles r ON r.id = ur.role_id WHERE ur.status = 'active' AND r.name = 'admin'));
CREATE POLICY admin_all_access ON roles FOR ALL USING (auth.uid() IN (SELECT ur.user_id FROM user_roles ur JOIN roles r ON r.id = ur.role_id WHERE ur.status = 'active' AND r.name = 'admin'));
CREATE POLICY admin_all_access ON user_roles FOR ALL USING (auth.uid() IN (SELECT ur.user_id FROM user_roles ur JOIN roles r ON r.id = ur.role_id WHERE ur.status = 'active' AND r.name = 'admin'));
CREATE POLICY admin_all_access ON sites FOR ALL USING (auth.uid() IN (SELECT ur.user_id FROM user_roles ur JOIN roles r ON r.id = ur.role_id WHERE ur.status = 'active' AND r.name = 'admin'));
CREATE POLICY admin_all_access ON categories FOR ALL USING (auth.uid() IN (SELECT ur.user_id FROM user_roles ur JOIN roles r ON r.id = ur.role_id WHERE ur.status = 'active' AND r.name = 'admin'));
CREATE POLICY admin_all_access ON workers FOR ALL USING (auth.uid() IN (SELECT ur.user_id FROM user_roles ur JOIN roles r ON r.id = ur.role_id WHERE ur.status = 'active' AND r.name = 'admin'));
CREATE POLICY admin_all_access ON tools FOR ALL USING (auth.uid() IN (SELECT ur.user_id FROM user_roles ur JOIN roles r ON r.id = ur.role_id WHERE ur.status = 'active' AND r.name = 'admin'));
CREATE POLICY admin_all_access ON issues FOR ALL USING (auth.uid() IN (SELECT ur.user_id FROM user_roles ur JOIN roles r ON r.id = ur.role_id WHERE ur.status = 'active' AND r.name = 'admin'));
CREATE POLICY admin_all_access ON issue_items FOR ALL USING (auth.uid() IN (SELECT ur.user_id FROM user_roles ur JOIN roles r ON r.id = ur.role_id WHERE ur.status = 'active' AND r.name = 'admin'));
CREATE POLICY admin_all_access ON returns FOR ALL USING (auth.uid() IN (SELECT ur.user_id FROM user_roles ur JOIN roles r ON r.id = ur.role_id WHERE ur.status = 'active' AND r.name = 'admin'));
CREATE POLICY admin_all_access ON return_items FOR ALL USING (auth.uid() IN (SELECT ur.user_id FROM user_roles ur JOIN roles r ON r.id = ur.role_id WHERE ur.status = 'active' AND r.name = 'admin'));
CREATE POLICY admin_all_access ON transfers FOR ALL USING (auth.uid() IN (SELECT ur.user_id FROM user_roles ur JOIN roles r ON r.id = ur.role_id WHERE ur.status = 'active' AND r.name = 'admin'));
CREATE POLICY admin_all_access ON stock_movements FOR ALL USING (auth.uid() IN (SELECT ur.user_id FROM user_roles ur JOIN roles r ON r.id = ur.role_id WHERE ur.status = 'active' AND r.name = 'admin'));
CREATE POLICY admin_all_access ON damage_records FOR ALL USING (auth.uid() IN (SELECT ur.user_id FROM user_roles ur JOIN roles r ON r.id = ur.role_id WHERE ur.status = 'active' AND r.name = 'admin'));
CREATE POLICY admin_all_access ON repairs FOR ALL USING (auth.uid() IN (SELECT ur.user_id FROM user_roles ur JOIN roles r ON r.id = ur.role_id WHERE ur.status = 'active' AND r.name = 'admin'));
CREATE POLICY admin_all_access ON activity_logs FOR ALL USING (auth.uid() IN (SELECT ur.user_id FROM user_roles ur JOIN roles r ON r.id = ur.role_id WHERE ur.status = 'active' AND r.name = 'admin'));
CREATE POLICY admin_all_access ON report_records FOR ALL USING (auth.uid() IN (SELECT ur.user_id FROM user_roles ur JOIN roles r ON r.id = ur.role_id WHERE ur.status = 'active' AND r.name = 'admin'));

-- Storekeeper: limited access (can read/write operational tables, but not user management)
CREATE POLICY storekeeper_read_sites ON sites FOR SELECT USING (auth.uid() IN (SELECT ur.user_id FROM user_roles ur JOIN roles r ON r.id = ur.role_id WHERE ur.status = 'active' AND r.name = 'storekeeper'));
CREATE POLICY storekeeper_read_categories ON categories FOR SELECT USING (auth.uid() IN (SELECT ur.user_id FROM user_roles ur JOIN roles r ON r.id = ur.role_id WHERE ur.status = 'active' AND r.name = 'storekeeper'));
CREATE POLICY storekeeper_rw_workers ON workers FOR ALL USING (auth.uid() IN (SELECT ur.user_id FROM user_roles ur JOIN roles r ON r.id = ur.role_id WHERE ur.status = 'active' AND r.name = 'storekeeper'));
CREATE POLICY storekeeper_rw_tools ON tools FOR ALL USING (auth.uid() IN (SELECT ur.user_id FROM user_roles ur JOIN roles r ON r.id = ur.role_id WHERE ur.status = 'active' AND r.name = 'storekeeper'));
CREATE POLICY storekeeper_rw_issues ON issues FOR ALL USING (auth.uid() IN (SELECT ur.user_id FROM user_roles ur JOIN roles r ON r.id = ur.role_id WHERE ur.status = 'active' AND r.name = 'storekeeper'));
CREATE POLICY storekeeper_rw_issue_items ON issue_items FOR ALL USING (auth.uid() IN (SELECT ur.user_id FROM user_roles ur JOIN roles r ON r.id = ur.role_id WHERE ur.status = 'active' AND r.name = 'storekeeper'));
CREATE POLICY storekeeper_rw_returns ON returns FOR ALL USING (auth.uid() IN (SELECT ur.user_id FROM user_roles ur JOIN roles r ON r.id = ur.role_id WHERE ur.status = 'active' AND r.name = 'storekeeper'));
CREATE POLICY storekeeper_rw_return_items ON return_items FOR ALL USING (auth.uid() IN (SELECT ur.user_id FROM user_roles ur JOIN roles r ON r.id = ur.role_id WHERE ur.status = 'active' AND r.name = 'storekeeper'));
CREATE POLICY storekeeper_rw_transfers ON transfers FOR ALL USING (auth.uid() IN (SELECT ur.user_id FROM user_roles ur JOIN roles r ON r.id = ur.role_id WHERE ur.status = 'active' AND r.name = 'storekeeper'));
CREATE POLICY storekeeper_read_movements ON stock_movements FOR SELECT USING (auth.uid() IN (SELECT ur.user_id FROM user_roles ur JOIN roles r ON r.id = ur.role_id WHERE ur.status = 'active' AND r.name = 'storekeeper'));
CREATE POLICY storekeeper_rw_damage ON damage_records FOR ALL USING (auth.uid() IN (SELECT ur.user_id FROM user_roles ur JOIN roles r ON r.id = ur.role_id WHERE ur.status = 'active' AND r.name = 'storekeeper'));
CREATE POLICY storekeeper_rw_repairs ON repairs FOR ALL USING (auth.uid() IN (SELECT ur.user_id FROM user_roles ur JOIN roles r ON r.id = ur.role_id WHERE ur.status = 'active' AND r.name = 'storekeeper'));
CREATE POLICY storekeeper_read_logs ON activity_logs FOR SELECT USING (auth.uid() IN (SELECT ur.user_id FROM user_roles ur JOIN roles r ON r.id = ur.role_id WHERE ur.status = 'active' AND r.name = 'storekeeper'));
CREATE POLICY storekeeper_rw_reports ON report_records FOR ALL USING (auth.uid() IN (SELECT ur.user_id FROM user_roles ur JOIN roles r ON r.id = ur.role_id WHERE ur.status = 'active' AND r.name = 'storekeeper'));

-- Users can always read their own profile
CREATE POLICY users_self_read ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY users_self_update ON users FOR UPDATE USING (auth.uid() = id);

-- Refuse silent deletes — mark as removed instead
-- Enforced via application logic (soft delete) rather than hard deletes
