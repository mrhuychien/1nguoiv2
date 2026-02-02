import { createClient } from '@/lib/supabase/server'
import type { UserRole } from '@/types/database.types'

export interface AdminCheckResult {
  isAdmin: boolean
  role: UserRole | null
  userId: string | null
  email: string | null
}

/**
 * Check if current user is an admin
 * Must be called from server-side only
 */
export async function checkAdmin(): Promise<AdminCheckResult> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { isAdmin: false, role: null, userId: null, email: null }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase as any)
    .from('profiles')
    .select('role, email')
    .eq('id', user.id)
    .single() as { data: { role: string; email: string } | null }

  if (!profile) {
    return { isAdmin: false, role: null, userId: user.id, email: user.email || null }
  }

  const role = (profile.role || 'user') as UserRole
  const isAdmin = role === 'admin' || role === 'super_admin'

  return {
    isAdmin,
    role,
    userId: user.id,
    email: profile.email,
  }
}

/**
 * Get admin email list (for hardcoded admin check)
 */
export function getAdminEmails(): string[] {
  return [
    'mrhuychien@gmail.com',
    // Add more admin emails here if needed
  ]
}

/**
 * Check if email is in admin list
 */
export function isAdminEmail(email: string): boolean {
  return getAdminEmails().includes(email.toLowerCase())
}
