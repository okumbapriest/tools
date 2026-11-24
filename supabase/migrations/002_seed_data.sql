-- TOOLROOM Seed Data
-- Run AFTER 001_initial_schema.sql has completed successfully

-- ============================================================
-- ROLES (already seeded in schema, but ensuring they exist)
-- ============================================================
INSERT INTO roles (name, description) VALUES
  ('admin',     'System administrator'),
  ('storekeeper', 'Physical store operator')
ON CONFLICT (name) DO NOTHING;

-- ============================================================
-- USERS — passwords set below via Supabase Dashboard > Auth > Users
-- After inserting here, go to Users panel and click "Set Password" for each
-- ============================================================
INSERT INTO users (email, full_name, password_hash, is_active) VALUES
  ('admin@toolroom.local',    'Admin User',           '', true),
  ('john.kamau@toolroom.local', 'John Kamau',          '', true)
ON CONFLICT (email) DO NOTHING;

-- Look up IDs after insert (use the IDs returned or query them)
WITH admin_user AS (SELECT id FROM users WHERE email = 'admin@toolroom.local' LIMIT 1),
     sk_user AS  (SELECT id FROM users WHERE email = 'john.kamau@toolroom.local' LIMIT 1),
     admin_role AS (SELECT id FROM roles WHERE name = 'admin' LIMIT 1),
     sk_role  AS  (SELECT id FROM roles WHERE name = 'storekeeper' LIMIT 1)
INSERT INTO user_roles (user_id, role_id, status)
SELECT admin_user.id, admin_role.id, 'active' FROM admin_user, admin_role
UNION ALL
SELECT sk_user.id,  sk_role.id,  'active' FROM sk_user, sk_role
ON CONFLICT (user_id, role_id) DO NOTHING;

-- ============================================================
-- SITES
-- ============================================================
INSERT INTO sites (name, location, project_code, is_active) VALUES
  ('Site A – West Wing',       'Plot 4B, Industrial Area',   'PRJ-001', true),
  ('Site B – East Block',      'Highland Road Phase 2',     'PRJ-002', true),
  ('Site C – River Extension', 'Kilimani Riverside',         'PRJ-003', true);

-- ============================================================
-- CATEGORIES
-- ============================================================
INSERT INTO categories (name, description) VALUES
  ('Power Tools',    'Battery / electric operated equipment'),
  ('Hand Tools',     'Manual tools requiring no power source'),
  ('Measuring & Leveling', 'Survey and alignment instruments'),
  ('Safety Gear',    'PPE and fall-arrest equipment'),
  ('Plumbing',       'Pipes, fittings and related tools'),
  ('Electrical',     'Wiring, conduit and testing equipment');

-- ============================================================
-- WORKERS
-- ============================================================
INSERT INTO workers (worker_id, full_name, phone_number, trade, assigned_site_id, supervisor, status)
SELECT
  'WR-001', 'Peter Mwangi', '+254 700 111 001', 'Electrician', s.id, 'Foreman Odhiambo', 'active'
FROM sites s WHERE s.project_code = 'PRJ-001'

UNION ALL

SELECT
  'WR-002', 'David Ochieng', '+254 700 111 002', 'Carpenter', s.id, 'Foreman Odhiambo', 'active'
FROM sites s WHERE s.project_code = 'PRJ-001'

UNION ALL

SELECT
  'WR-003', 'James Otieno', '+254 700 111 003', 'Plumber', s.id, 'Foreman Wanjiku', 'active'
FROM sites s WHERE s.project_code = 'PRJ-002'

UNION ALL

SELECT
  'WR-004', 'Samuel Kiprop', '+254 700 111 004', 'Mason', s.id, 'Foreman Wanjiku', 'active'
FROM sites s WHERE s.project_code = 'PRJ-002'

UNION ALL

SELECT
  'WR-005', 'Grace Akinyi', '+254 700 111 005', 'Steel Fixer', s.id, NULL, 'active'
FROM sites s WHERE s.project_code = 'PRJ-003'

UNION ALL

SELECT
  'WR-006', 'Brian Mutua', '+254 700 111 006', 'Welder', s.id, 'Foreman Odhiambo', 'active'
FROM sites s WHERE s.project_code = 'PRJ-001';

-- ============================================================
-- TOOLS
-- ============================================================
INSERT INTO tools (tool_name, asset_code, category_id, total_quantity, available_quantity, issued_quantity, damaged_quantity, under_repair_quantity, missing_quantity, storage_location, condition, minimum_stock)
SELECT
  'Cordless Drill',              'TRL-DRL-001', c.id, 15, 9,  4,  1,  1,  0, 'Shelf A1', 'good',    5
FROM categories c WHERE c.name = 'Power Tools'

UNION ALL
SELECT
  'Circular Saw',               'TRL-SAW-001', c.id, 6,  4,  1,  0,  1,  0, 'Shelf A2', 'good',    3
FROM categories c WHERE c.name = 'Power Tools'

UNION ALL
SELECT
  'Angle Grinder',              'TRL-GRN-001', c.id, 8,  6,  1,  1,  0,  0, 'Shelf A1', 'good',    3
FROM categories c WHERE c.name = 'Power Tools'

UNION ALL
SELECT
  'Hammer',                     'TRL-HMM-001', c.id, 40, 28,  8,  2,  1,  1, 'Rack B1', 'good',   10
FROM categories c WHERE c.name = 'Hand Tools'

UNION ALL
SELECT
  'Sledgehammer',               'TRL-SLM-001', c.id, 10, 7,  2,  1,  0,  0, 'Rack B2', 'good',    3
FROM categories c WHERE c.name = 'Hand Tools'

UNION ALL
SELECT
  'Spirit Level (2m)',          'TRL-LVL-001', c.id, 12, 10,  1,  0,  1,  0, 'Shelf C1', 'good',    4
FROM categories c WHERE c.name = 'Measuring & Leveling'

UNION ALL
SELECT
  'Tape Measure 8m',            'TRL-TAP-001', c.id, 25, 18,  5,  1,  1,  0, 'Shelf C2', 'good',    8
FROM categories c WHERE c.name = 'Measuring & Leveling'

UNION ALL
SELECT
  'Extension Cable 25m',        'TRL-EXT-001', c.id, 20, 14,  4,  1,  1,  0, 'Shelf D1', 'good',    6
FROM categories c WHERE c.name = 'Electrical'

UNION ALL
SELECT
  'Pipe Wrench 18"',            'TRL-PNW-001', c.id, 10, 8,  1,  0,  0,  1, 'Shelf E1', 'good',    3
FROM categories c WHERE c.name = 'Plumbing'

UNION ALL
SELECT
  'Hard Hat',                   'SHF-HDM-001', c.id, 50, 38,  9,  1,  2,  0, 'Locker Room', 'good',   15
FROM categories c WHERE c.name = 'Safety Gear';

-- ============================================================
-- SAMPLE ISSUES (so accountability page isn't empty)
-- ============================================================
WITH
  wr_peter AS (SELECT id FROM workers WHERE worker_id = 'WR-001'),
  wr_david AS (SELECT id FROM workers WHERE worker_id = 'WR-002'),
  wr_james AS (SELECT id FROM workers WHERE worker_id = 'WR-003'),
  drll_id  AS (SELECT id FROM tools WHERE asset_code = 'TRL-DRL-001'),
  hmm_id   AS (SELECT id FROM tools WHERE asset_code = 'TRL-HMM-001'),
  ext_id   AS (SELECT id FROM tools WHERE asset_code = 'TRL-EXT-001'),
  lvl_id   AS (SELECT id FROM tools WHERE asset_code = 'TRL-LVL-001'),
  sk_id    AS (SELECT id FROM users WHERE email = 'john.kamau@toolroom.local')
INSERT INTO issues (reference, worker_id, storekeeper_id, site_id, work_area, expected_return_date, purpose, status)
VALUES
  ('ISSUE-' || LPAD(EXTRACT(EPOCH FROM now())::BIGINT::TEXT, 6, '0'), (SELECT id FROM wr_peter), (SELECT id FROM sk_id), NULL, 'West wing floor 2',  DATE(now() + INTERVAL '3 days'), 'Wiring installation', 'issued'),
  ('ISSUE-' || LPAD((EXTRACT(EPOCH FROM now())::BIGINT - 1)::TEXT, 6, '0'), (SELECT id FROM wr_david), (SELECT id FROM sk_id), NULL, 'East block framing',  DATE(now() - INTERVAL '1 day'), 'Frame assembly', 'overdue'),
  ('ISSUE-' || LPAD((EXTRACT(EPOCH FROM now())::BIGINT - 2)::TEXT, 6, '0'), (SELECT id FROM wr_james), (SELECT id FROM sk_id), NULL, 'Plumbing rough-in',  DATE(now() + INTERVAL '2 days'), 'Bathroom fit-out', 'issued')
RETURNING id, reference;

-- Add issue_items for each issue above
WITH
  ir1 AS (SELECT id FROM issues ORDER BY created_at DESC LIMIT 1),
  ir2 AS (SELECT id FROM issues WHERE status = 'overdue' LIMIT 1),
  ir3 AS (SELECT id FROM issues WHERE reference NOT IN (SELECT reference FROM issues WHERE status = 'overdue') ORDER BY created_at ASC LIMIT 1),
  drll AS (SELECT id FROM tools WHERE asset_code = 'TRL-DRL-001'),
  hmm AS  (SELECT id FROM tools WHERE asset_code = 'TRL-HMM-001'),
  ext AS  (SELECT id FROM tools WHERE asset_code = 'TRL-EXT-001'),
  lvl AS  (SELECT id FROM tools WHERE asset_code = 'TRL-LVL-001')
INSERT INTO issue_items (issue_id, tool_id, quantity)
VALUES
  ((SELECT id FROM ir1), (SELECT id FROM drll), 1),
  ((SELECT id FROM ir2), (SELECT id FROM hmm),  3),
  ((SELECT id FROM ir3), (SELECT id FROM ext),  2),
  ((SELECT id FROM ir3), (SELECT id FROM lvl),  1);

-- ============================================================
-- SAMPLE ACTIVITY LOGS
-- ============================================================
WITH sk_id AS (SELECT id FROM users WHERE email = 'john.kamau@toolroom.local'),
     adm_id AS (SELECT id FROM users WHERE email = 'admin@toolroom.local')
INSERT INTO activity_logs (action, user_id, target_table, details, created_at)
VALUES
  ('tool_issued',  (SELECT id FROM sk_id), 'issues', '{"reference":"ISSUE-sample"}', now() - INTERVAL '2 hours'),
  ('tool_added',   (SELECT id FROM adm_id), 'tools',  '{"tool_name":"Hammer","qty":40}', now() - INTERVAL '60 days'),
  ('login',        (SELECT id FROM sk_id),  NULL,     '{"ip":"192.168.1.50"}', now() - INTERVAL '1 hour'),
  ('login',        (SELECT id FROM adm_id), NULL,     '{"ip":"192.168.1.1"}',  now() - INTERVAL '30 minutes');
