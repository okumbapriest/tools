'use server'

import { createServerSupabaseClient } from './supabase/server'
import type {
  Worker, Tool, Issue, Return, Transfer, DamageRecord, Repair,
  ActivityLog, Site, DashboardStats, TodayMovements
} from '@/types/database'

// ============================================================
// DASHBOARD STATS
// ============================================================
export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createServerSupabaseClient()
  const { data: tools } = await supabase
    .from('tools')
    .select('total_quantity, available_quantity, issued_quantity, damaged_quantity, under_repair_quantity, missing_quantity')
    

  const { count: totalWorkers } = await supabase
    .from('workers')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')

  const today = new Date().toISOString().split('T')[0]

  const { count: overdueCount } = await supabase
    .from('issues')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'issued')
    .lt('expected_return_date', today)

  return {
    total_tools: tools?.reduce((sum, t) => sum + (t.total_quantity ?? 0), 0) ?? 0,
    in_store: tools?.reduce((sum, t) => sum + (t.available_quantity ?? 0), 0) ?? 0,
    issued: tools?.reduce((sum, t) => sum + (t.issued_quantity ?? 0), 0) ?? 0,
    damaged: tools?.reduce((sum, t) => sum + (t.damaged_quantity ?? 0), 0) ?? 0,
    overdue: overdueCount ?? 0,
    under_repair: tools?.reduce((sum, t) => sum + (t.under_repair_quantity ?? 0), 0) ?? 0,
    missing: tools?.reduce((sum, t) => sum + (t.missing_quantity ?? 0), 0) ?? 0,
    total_workers: totalWorkers ?? 0,
    active_workers: totalWorkers ?? 0,
  }
}

export async function getTodayMovements(): Promise<TodayMovements> {
  const supabase = await createServerSupabaseClient()
  const today = new Date().toISOString().split('T')[0]
  const [issueRes, returnRes] = await Promise.all([
    supabase.from('issues').select('*', { count: 'exact', head: true }).gte('created_at', today),
    supabase.from('returns').select('*', { count: 'exact', head: true }).gte('returned_at', today),
  ])
  return {
    issues: issueRes.count ?? 0,
    returns: returnRes.count ?? 0,
  }
}

// ============================================================
// WORKERS
// ============================================================
export async function getAllWorkers(): Promise<Worker[]> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('workers')
    .select('*')
    .order('full_name')
  if (error) throw error
  return data ?? []
}

export async function searchWorkers(query: string): Promise<Worker[]> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('workers')
    .select('*')
    .or(`full_name.ilike.%${query}%,worker_id.ilike.%${query}%,phone_number.ilike.%${query}%`)
    .order('full_name')
  if (error) throw error
  return data ?? []
}

export async function getWorker(workerId: string): Promise<Worker | null> {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase.from('workers').select('*').eq('id', workerId).single()
  return data
}

export async function getWorkerProfile(id: string) {
  const supabase = await createServerSupabaseClient()
  const { data: worker } = await supabase
    .from('workers')
    .select('*')
    .eq('id', id)
    .single()

  const { data: currentIssues } = await supabase
    .from('issues')
    .select(`
      id, reference, status, created_at, expected_return_date,
      site_id, work_area, purpose,
      issue_items ( tool_id, quantity )
    `)
    .eq('worker_id', id)
    .in('status', ['issued', 'partially_returned'])
    .order('created_at', { ascending: false })

  const { data: history } = await supabase
    .from('issues')
    .select(`
      id, reference, status, created_at,
      issue_items ( tool_id, quantity )
    `)
    .eq('worker_id', id)
    .not('status', 'eq', 'issued')
    .order('created_at', { ascending: false })
    .limit(50)

  const { data: transfers } = await supabase
    .from('transfers')
    .select('*')
    .or(`from_worker_id.eq.${id},to_worker_id.eq.${id}`)
    .order('created_at', { ascending: false })

  const { data: damages } = await supabase
    .from('damage_records')
    .select('*')
    .eq('worker_id', id)
    .order('reported_at', { ascending: false })

  return { worker, currentIssues, history, transfers, damages }
}

export async function createWorker(data: Omit<Worker, 'id' | 'created_at' | 'updated_at'>) {
  const supabase = await createServerSupabaseClient()
  const { data: result, error } = await supabase
    .from('workers')
    .insert(data)
    .select()
    .single()
  if (error) throw error
  return result
}

export async function updateWorker(id: string, data: Partial<Worker>) {
  const supabase = await createServerSupabaseClient()
  const { data: result, error } = await supabase
    .from('workers')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return result
}

// ============================================================
// TOOLS
// ============================================================
export async function searchTools(query: string) {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('tools')
    .select(`
      *,
      categories ( name ),
      stock_movements ( movement_type, quantity_change, created_at, performed_by )
    `)
    .or(`tool_name.ilike.%${query}%,asset_code.ilike.%${query}%`)
    .order('tool_name')
  return data
}

export async function getTool(toolId: string) {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('tools')
    .select(`
      *,
      categories ( name ),
      stock_movements (*)
    `)
    .eq('id', toolId)
    .single()
  return data
}

export async function getAllTools() {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('tools')
    .select('*, categories(name)')
    .order('tool_name')
  return data
}

export async function createTool(data: any) {
  const supabase = await createServerSupabaseClient()
  const { data: result, error } = await supabase
    .from('tools')
    .insert(data)
    .select()
    .single()
  if (error) throw error
  return result
}

export async function updateTool(id: string, data: any) {
  const supabase = await createServerSupabaseClient()
  const { data: result, error } = await supabase
    .from('tools')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return result
}

// ============================================================
// ISSUES
// ============================================================
export async function createIssue(issueData: any, items: Array<{ tool_id: string; quantity: number }>) {
  const supabase = await createServerSupabaseClient()
  const { data: issue, error } = await supabase
    .from('issues')
    .insert(issueData)
    .select()
    .single()
  if (error) throw error

  const { error: itemError } = await supabase
    .from('issue_items')
    .insert(items.map(i => ({ ...i, issue_id: issue.id })))

  if (itemError) throw itemError

  return issue
}

export async function getOutstandingTools(filters?: {
  worker_id?: string
  tool_id?: string
  site_id?: string
  status?: string
}) {
  const supabase = await createServerSupabaseClient()
  let query = supabase
    .from('issues')
    .select(`
      *,
      workers ( full_name, worker_id, assigned_site_id, sites ( name ) ),
      issue_items ( tools ( tool_name, asset_code, category_id ) )
    `)
    .in('status', ['issued', 'partially_returned'])

  if (filters?.worker_id) query = query.eq('worker_id', filters.worker_id)
  if (filters?.site_id) query = query.eq('site_id', filters.site_id)
  if (filters?.status === 'overdue') {
    query = query.lt('expected_return_date', new Date().toISOString().split('T')[0])
  }

  const { data } = await query.order('expected_return_date', { ascending: true })
  return data
}

// ============================================================
// RETURNS
// ============================================================
export async function getWorkerOutstandingItems(workerId: string) {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('issues')
    .select(`
      id, reference,
      issue_items (
        id as issue_item_id,
        tool_id,
        quantity,
        tools ( tool_name, asset_code )
      )
    `)
    .eq('worker_id', workerId)
    .in('status', ['issued', 'partially_returned'])
    .order('created_at', { ascending: false })
  return data
}

export async function createReturn(returnData: any, items: Array<{
  tool_id: string
  quantity_returned: number
  condition: string
  inspection_notes?: string
}>) {
  const supabase = await createServerSupabaseClient()
  const { data: ret, error } = await supabase
    .from('returns')
    .insert(returnData)
    .select()
    .single()
  if (error) throw error

  const { error: itemError } = await supabase
    .from('return_items')
    .insert(items.map(i => ({ ...i, return_id: ret.id })))

  if (itemError) throw itemError
  return ret
}

// ============================================================
// TRANSFERS
// ============================================================
export async function createTransfer(data: any) {
  const supabase = await createServerSupabaseClient()
  const { data: result, error } = await supabase
    .from('transfers')
    .insert(data)
    .select()
    .single()
  if (error) throw error
  return result
}

// ============================================================
// DAMAGE & REPAIRS
// ============================================================
export async function reportDamage(data: any) {
  const supabase = await createServerSupabaseClient()
  const { data: record, error } = await supabase
    .from('damage_records')
    .insert(data)
    .select()
    .single()
  if (error) throw error

  await supabase.from('repairs').insert({
    damage_record_id: record.id,
    tool_id: data.tool_id,
    issue_type: data.damage_description,
    status: 'pending',
    reported_by: data.reported_by,
  })

  return record
}

export async function getDamagedAndRepairs() {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('damage_records')
    .select(`
      *,
      tools ( tool_name, asset_code ),
      repairs (*)
    `)
    .order('reported_at', { ascending: false })
  return data
}

// ============================================================
// ACTIVITY LOG
// ============================================================
export async function getActivityLogs(filters?: {
  action?: string
  dateFrom?: string
  dateTo?: string
  user_id?: string
}) {
  const supabase = await createServerSupabaseClient()
  let query = supabase
    .from('activity_logs')
    .select(`
      *,
      users ( full_name, email )
    `)
    .order('created_at', { ascending: false })
    .limit(200)

  if (filters?.action) query = query.eq('action', filters.action)
  if (filters?.dateFrom) query = query.gte('created_at', filters.dateFrom)
  if (filters?.dateTo) query = query.lte('created_at', filters.dateTo)
  if (filters?.user_id) query = query.eq('user_id', filters.user_id)

  const { data } = await query
  return data
}

// ============================================================
// REPORTS (aggregated data for export)
// ============================================================
export async function getInventoryReport(periodDays: number) {
  const supabase = await createServerSupabaseClient()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - periodDays)

  const { data: tools } = await supabase
    .from('tools')
    .select(`
      id, tool_name, asset_code,
      total_quantity, available_quantity, issued_quantity,
      damaged_quantity, under_repair_quantity, missing_quantity,
      storage_location, minimum_stock, description,
      categories ( name ),
      sites ( name )
    `)
    .order('tool_name')

  const { data: movements } = await supabase
    .from('stock_movements')
    .select(`
      tool_id, movement_type, quantity_change, reason,
      performed_by, created_at,
      issues ( worker_id, reference ),
      workers ( full_name, worker_id )
    `)
    .gte('created_at', startDate.toISOString())

  return { tools, movements }
}

// ============================================================
// STOREKEEPER CONTROL (Admin only)
// ============================================================
export async function getAppointedStorekeeper() {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('user_roles')
    .select(`
      *,
      users ( id, email, full_name, phone_number, avatar_url, last_login ),
      roles ( name )
    `)
    .eq('role_id', (await supabase.from('roles').select('id').eq('name', 'storekeeper').single()).data?.id)
    .eq('status', 'active')
    .single()
  return data
}

export async function appointStorekeeper(userId: string, appointedById: string) {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('user_roles')
    .upsert({
      user_id: userId,
      role_id: (await supabase.from('roles').select('id').eq('name', 'storekeeper').single()).data?.id,
      appointed_by: appointedById,
      status: 'active',
      appointed_at: new Date().toISOString(),
    }, { onConflict: 'user_id,role_id' })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function removeStorekeeper(userId: string) {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('user_roles')
    .update({ status: 'removed' })
    .eq('user_id', userId)
    .eq('role_id', (await supabase.from('roles').select('id').eq('name', 'storekeeper').single()).data?.id)
    .select()
  if (error) throw error
  return data
}

// ============================================================
// SITES
// ============================================================
export async function getSites(activeOnly = true) {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('sites')
    .select('*')
    .eq('is_active', activeOnly)
    .order('name')
  return data
}

// ============================================================
// CATEGORIES
// ============================================================
export async function getCategories() {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('categories')
    .select('*')
    .order('name')
  return data
}
