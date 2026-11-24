// ---- Roles ----

export type RoleName = 'admin' | 'storekeeper'

export interface Role {
  id: string
  name: RoleName
  description: string
}

// ---- Users / Auth ----

export interface User {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  phone_number: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface UserRole {
  id: string
  user_id: string
  role_id: string
  appointed_by: string | null
  appointed_at: string
  status: 'active' | 'removed'
}

// ---- Workers ----

export type WorkerStatus = 'active' | 'inactive'

export interface Worker {
  id: string
  worker_id: string          // WR-001, WR-002, etc.
  full_name: string
  phone_number: string | null
  trade: string | null        // occupation / trade
  assigned_site_id: string | null
  supervisor: string | null
  status: WorkerStatus
  notes: string | null
  created_at: string
  updated_at: string
}

// ---- Sites ----

export interface Site {
  id: string
  name: string
  location: string | null
  project_code: string | null
  is_active: boolean
  created_at: string
}

// ---- Categories ----

export interface Category {
  id: string
  name: string
  description: string | null
  created_at: string
}

// ---- Tools ----

export type ToolCondition = 'good' | 'damaged' | 'under_repair' | 'missing' | 'retired'

export interface Tool {
  id: string
  tool_name: string
  asset_code: string | null   // Unique identification code
  category_id: string | null
  total_quantity: number
  available_quantity: number  // Recomputed: total - issued - damaged - under_repair - missing
  issued_quantity: number
  damaged_quantity: number
  under_repair_quantity: number
  missing_quantity: number
  storage_location: string | null
  condition: ToolCondition
  minimum_stock: number       // Alert threshold
  description: string | null
  photo_url: string | null
  created_at: string
  updated_at: string
}

// ---- Issues (Tool Issuance) ----

export type IssueStatus = 'issued' | 'returned' | 'partially_returned' | 'transferred'

export interface Issue {
  id: string
  reference: string           // e.g., ISSUE-001
  worker_id: string
  storekeeper_id: string      // Who recorded this issue
  site_id: string | null
  work_area: string | null
  expected_return_date: string | null
  purpose: string | null
  status: IssueStatus
  acknowledged_at: string | null
  created_at: string
}

export interface IssueItem {
  id: string
  issue_id: string
  tool_id: string
  quantity: number
}

// ---- Returns ----

export type ReturnCondition = 'good' | 'damaged' | 'needs_repair' | 'incomplete'

export interface Return {
  id: string
  reference: string           // e.g., RETURN-002
  issue_id: string
  worker_id: string
  storekeeper_id: string
  returned_at: string
  notes: string | null
  inspected_by: string | null
  created_at: string
}

export interface ReturnItem {
  id: string
  return_id: string
  tool_id: string
  quantity_returned: number
  condition: ReturnCondition
  inspection_notes: string | null
}

// ---- Transfers ----

export interface Transfer {
  id: string
  reference: string           // e.g., TRANSFER-004
  issue_item_id: string       // Which issued item is being transferred
  from_worker_id: string
  to_worker_id: string
  site_id: string | null
  transfer_reason: string | null
  acknowledged_by_new_holder_at: string | null
  confirmed_by_storekeeper_at: string | null
  created_at: string
}

// ---- Stock Movements (Ledger) ----

export type MovementType = 'registration' | 'issue' | 'return_good' | 'return_damaged' |
                           'transfer_in' | 'transfer_out' | 'damage_report' | 'repair_start' |
                           'repair_complete' | 'adjustment' | 'missing_report' | 'retirement'

export interface StockMovement {
  id: string
  tool_id: string
  movement_type: MovementType
  quantity_change: number     // positive = stock up, negative = stock down
  reference_type: string | null    // 'issue', 'return', 'transfer', etc.
  reference_id: string | null    // FK to issues / returns / transfers table
  reason: string | null
  performed_by: string | null  // user_id
  created_at: string
}

// ---- Damage Records ----

export type DamageStatus = 'reported' | 'inspected' | 'under_repair' | 'written_off' | 'resolved'

export interface DamageRecord {
  id: string
  tool_id: string
  reported_by: string         // user_id of reporter (worker or storekeeper)
  worker_id: string | null
  site_id: string | null
  reported_at: string
  damage_description: string | null
  evidence_photo_url: string | null
  action_taken: string | null
  status: DamageStatus
  created_at: string
}

// ---- Repairs ----

export type RepairStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled'

export interface Repair {
  id: string
  damage_record_id: string | null
  tool_id: string
  issue_type: string | null   // motor problem, broken handle, cable fault, etc.
  status: RepairStatus
  reported_by: string         // user_id
  started_at: string | null
  completed_at: string | null
  cost_estimate: number | null
  notes: string | null
  created_at: string
}

// ---- Activity Logs (Audit Trail) ----

export type ActivityAction = 'tool_issued' | 'tool_returned' | 'worker_registered' |
  'tool_added' | 'storekeeper_changed' | 'report_downloaded' | 'tool_transferred' |
  'damage_reported' | 'repair_started' | 'repair_completed' | 'tool_edited' |
  'login' | 'logout' | 'stock_adjusted'

export interface ActivityLog {
  id: string
  action: ActivityAction
  user_id: string | null      // Who performed the action
  target_table: string | null // Which table was affected
  target_id: string | null    // ID of the affected record
  details: Record<string, unknown> | null
  created_at: string
}

// ---- Dashboard aggregates (computed/views) ----

export interface DashboardStats {
  total_tools: number
  in_store: number
  issued: number
  damaged: number
  overdue: number
  under_repair: number
  missing: number
  total_workers: number
  active_workers: number
}

export interface TodayMovements {
  issues: number
  returns: number
}
