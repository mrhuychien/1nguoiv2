'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Shield,
  Key,
  Check,
  X,
  Loader2,
  AlertTriangle,
  RefreshCw,
  Settings2,
  Users,
  Crown,
  User,
  ShieldCheck,
} from 'lucide-react'

interface AIProvider {
  id: string
  provider: string
  display_name: string
  agent: string
  icon: string
  is_enabled: boolean
  is_configured: boolean
  total_requests: number
  total_tokens: number
  total_cost: number
  last_used_at: string | null
  updated_at: string
}

interface UserProfile {
  id: string
  email: string
  full_name: string | null
  role: 'user' | 'admin' | 'super_admin'
  subscription: 'free' | 'pro'
  created_at: string
  updated_at: string
}

type Tab = 'ai' | 'users'

export default function AdminPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>('ai')
  const [providers, setProviders] = useState<AIProvider[]>([])
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [currentUserRole, setCurrentUserRole] = useState<string>('user')

  // Load data based on tab
  useEffect(() => {
    if (activeTab === 'ai') {
      loadProviders()
    } else {
      loadUsers()
    }
  }, [activeTab])

  async function loadProviders() {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/ai-settings')

      if (res.status === 403) {
        setIsAdmin(false)
        setError('Bạn không có quyền truy cập trang này')
        return
      }

      if (!res.ok) {
        throw new Error('Failed to load providers')
      }

      const data = await res.json()
      setProviders(data.providers)
      setIsAdmin(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  async function loadUsers() {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/users')

      if (res.status === 403) {
        setIsAdmin(false)
        setError('Bạn không có quyền truy cập trang này')
        return
      }

      if (!res.ok) {
        throw new Error('Failed to load users')
      }

      const data = await res.json()
      setUsers(data.users || [])
      setIsAdmin(true)

      // Find current user's role
      const currentUser = data.users?.find((u: UserProfile) => u.role === 'super_admin' || u.role === 'admin')
      if (currentUser) {
        setCurrentUserRole(currentUser.role)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  async function updateUser(userId: string, updates: { subscription?: string; role?: string }) {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...updates }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to update')
      }

      loadUsers()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update user')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
      </div>
    )
  }

  if (isAdmin === false) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Shield className="w-16 h-16 text-red-400" />
        <h1 className="text-2xl font-bold text-white">Truy cập bị từ chối</h1>
        <p className="text-gray-400">Bạn không có quyền truy cập trang Admin</p>
        <button
          onClick={() => router.push('/dashboard')}
          className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600"
        >
          Quay lại Dashboard
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-cyan-500/10 rounded-xl">
          <Settings2 className="w-8 h-8 text-cyan-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Admin Settings</h1>
          <p className="text-gray-400">Quản lý hệ thống và người dùng</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('ai')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'ai'
              ? 'bg-cyan-500 text-white'
              : 'bg-white/5 text-gray-400 hover:text-white'
          }`}
        >
          <Key className="w-4 h-4" />
          AI Providers
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'users'
              ? 'bg-cyan-500 text-white'
              : 'bg-white/5 text-gray-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          Người dùng
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400" />
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* AI Providers Tab */}
      {activeTab === 'ai' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">AI Providers</h2>
            <button
              onClick={loadProviders}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-400 hover:text-white transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>

          <div className="grid gap-4">
            {providers.map((provider) => (
              <ProviderCard
                key={provider.id}
                provider={provider}
                onUpdate={loadProviders}
              />
            ))}
          </div>

          {/* Security Notice */}
          <div className="mt-8 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-yellow-400">Bảo mật API Keys</h3>
                <ul className="mt-2 text-sm text-gray-300 space-y-1">
                  <li>• API keys được mã hóa AES-256-GCM trước khi lưu</li>
                  <li>• Keys không bao giờ được gửi về client</li>
                  <li>• Chỉ admins mới có thể xem/sửa cấu hình</li>
                  <li>• Tất cả thao tác được ghi log</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Quản lý người dùng</h2>
            <button
              onClick={loadUsers}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-400 hover:text-white transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <p className="text-sm text-gray-400">Tổng người dùng</p>
              <p className="text-2xl font-bold text-white">{users.length}</p>
            </div>
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
              <p className="text-sm text-green-400">PRO Users</p>
              <p className="text-2xl font-bold text-green-400">
                {users.filter(u => u.subscription === 'pro').length}
              </p>
            </div>
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
              <p className="text-sm text-purple-400">Admins</p>
              <p className="text-2xl font-bold text-purple-400">
                {users.filter(u => u.role === 'admin' || u.role === 'super_admin').length}
              </p>
            </div>
          </div>

          {/* Users List */}
          <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">User</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Role</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Subscription</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Ngày tạo</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-white/5">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-white text-sm font-medium">
                          {user.full_name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">
                            {user.full_name || 'Chưa đặt tên'}
                          </p>
                          <p className="text-xs text-gray-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        user.role === 'super_admin'
                          ? 'bg-red-500/10 text-red-400'
                          : user.role === 'admin'
                          ? 'bg-purple-500/10 text-purple-400'
                          : 'bg-gray-500/10 text-gray-400'
                      }`}>
                        {user.role === 'super_admin' ? (
                          <ShieldCheck className="w-3 h-3" />
                        ) : user.role === 'admin' ? (
                          <Shield className="w-3 h-3" />
                        ) : (
                          <User className="w-3 h-3" />
                        )}
                        {user.role === 'super_admin' ? 'Super Admin' : user.role === 'admin' ? 'Admin' : 'User'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        user.subscription === 'pro'
                          ? 'bg-green-500/10 text-green-400'
                          : 'bg-gray-500/10 text-gray-400'
                      }`}>
                        {user.subscription === 'pro' ? (
                          <Crown className="w-3 h-3" />
                        ) : (
                          <User className="w-3 h-3" />
                        )}
                        {user.subscription === 'pro' ? 'PRO' : 'FREE'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400">
                      {new Date(user.created_at).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {user.subscription === 'free' ? (
                          <button
                            onClick={() => updateUser(user.id, { subscription: 'pro' })}
                            className="px-2 py-1 text-xs bg-green-500/10 text-green-400 rounded hover:bg-green-500/20 transition-colors"
                          >
                            Nâng PRO
                          </button>
                        ) : (
                          <button
                            onClick={() => updateUser(user.id, { subscription: 'free' })}
                            className="px-2 py-1 text-xs bg-gray-500/10 text-gray-400 rounded hover:bg-gray-500/20 transition-colors"
                          >
                            Hạ FREE
                          </button>
                        )}
                        {currentUserRole === 'super_admin' && user.role === 'user' && (
                          <button
                            onClick={() => updateUser(user.id, { role: 'admin' })}
                            className="px-2 py-1 text-xs bg-purple-500/10 text-purple-400 rounded hover:bg-purple-500/20 transition-colors"
                          >
                            → Admin
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Info */}
          <div className="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-xl">
            <div className="flex items-start gap-3">
              <Crown className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-cyan-400">Phân quyền</h3>
                <ul className="mt-2 text-sm text-gray-300 space-y-1">
                  <li><strong>FREE:</strong> Sử dụng các tính năng không cần API (Dashboard, Zen Focus, Ideas, Projects)</li>
                  <li><strong>PRO:</strong> Sử dụng tất cả tính năng bao gồm Combat Pro, Brainstorm AI</li>
                  <li><strong>Admin:</strong> Quản lý AI settings và nâng/hạ cấp người dùng</li>
                  <li><strong>Super Admin:</strong> Toàn quyền bao gồm thay đổi role</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ProviderCard({
  provider,
  onUpdate,
}: {
  provider: AIProvider
  onUpdate: () => void
}) {
  const [showKeyInput, setShowKeyInput] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<{
    success: boolean
    message: string
  } | null>(null)

  const agentColors: Record<string, string> = {
    SPARK: 'text-green-400 bg-green-500/10',
    LENS: 'text-cyan-400 bg-cyan-500/10',
    RADAR: 'text-purple-400 bg-purple-500/10',
    DEVIL: 'text-red-400 bg-red-500/10',
  }

  async function handleSaveKey() {
    if (!apiKey.trim()) return

    setSaving(true)
    setTestResult(null)

    try {
      const res = await fetch(`/api/admin/ai-settings/${provider.provider}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ api_key: apiKey }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to save')
      }

      setApiKey('')
      setShowKeyInput(false)
      onUpdate()
    } catch (err) {
      setTestResult({
        success: false,
        message: err instanceof Error ? err.message : 'Failed to save',
      })
    } finally {
      setSaving(false)
    }
  }

  async function handleToggleEnabled() {
    setSaving(true)

    try {
      const res = await fetch(`/api/admin/ai-settings/${provider.provider}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_enabled: !provider.is_enabled }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to update')
      }

      onUpdate()
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  async function handleRemoveKey() {
    if (!confirm('Bạn có chắc muốn xóa API key này?')) return

    setSaving(true)

    try {
      const res = await fetch(`/api/admin/ai-settings/${provider.provider}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        throw new Error('Failed to remove key')
      }

      onUpdate()
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  async function handleTestKey() {
    setTesting(true)
    setTestResult(null)

    try {
      const res = await fetch(
        `/api/admin/ai-settings/${provider.provider}/test`,
        { method: 'POST' }
      )

      const data = await res.json()

      setTestResult({
        success: data.success,
        message: data.message || data.error,
      })
    } catch (err) {
      setTestResult({
        success: false,
        message: err instanceof Error ? err.message : 'Test failed',
      })
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{provider.icon}</span>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white">
                {provider.display_name}
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  agentColors[provider.agent] || 'text-gray-400 bg-gray-500/10'
                }`}
              >
                {provider.agent}
              </span>
            </div>
            <p className="text-sm text-gray-400">{provider.provider}</p>
          </div>
        </div>

        {/* Status & Toggle */}
        <div className="flex items-center gap-3">
          {provider.is_configured ? (
            <span className="flex items-center gap-1.5 text-sm text-green-400">
              <Check className="w-4 h-4" />
              Configured
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-sm text-gray-400">
              <X className="w-4 h-4" />
              Not configured
            </span>
          )}

          {/* Enable/Disable Toggle */}
          <button
            onClick={handleToggleEnabled}
            disabled={!provider.is_configured || saving}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              provider.is_enabled
                ? 'bg-green-500'
                : 'bg-gray-600'
            } ${!provider.is_configured ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <div
              className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                provider.is_enabled ? 'left-7' : 'left-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Stats */}
      {provider.is_configured && (
        <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-white/5 rounded-lg">
          <div>
            <p className="text-xs text-gray-400">Requests</p>
            <p className="font-semibold text-white">
              {provider.total_requests.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Tokens</p>
            <p className="font-semibold text-white">
              {provider.total_tokens.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Cost</p>
            <p className="font-semibold text-white">
              ${provider.total_cost.toFixed(4)}
            </p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2">
        {!showKeyInput ? (
          <>
            <button
              onClick={() => setShowKeyInput(true)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-cyan-500/10 text-cyan-400 rounded-lg hover:bg-cyan-500/20 transition-colors"
            >
              <Key className="w-4 h-4" />
              {provider.is_configured ? 'Update Key' : 'Add Key'}
            </button>

            {provider.is_configured && (
              <>
                <button
                  onClick={handleTestKey}
                  disabled={testing}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm bg-white/5 text-gray-300 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50"
                >
                  {testing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  Test
                </button>

                <button
                  onClick={handleRemoveKey}
                  disabled={saving}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                  Remove
                </button>
              </>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center gap-2">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={`Enter ${provider.provider} API key...`}
              className="flex-1 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
            />
            <button
              onClick={handleSaveKey}
              disabled={saving || !apiKey.trim()}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              Save
            </button>
            <button
              onClick={() => {
                setShowKeyInput(false)
                setApiKey('')
              }}
              className="px-3 py-1.5 text-sm text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Test Result */}
      {testResult && (
        <div
          className={`mt-3 p-3 rounded-lg flex items-center gap-2 ${
            testResult.success
              ? 'bg-green-500/10 text-green-400'
              : 'bg-red-500/10 text-red-400'
          }`}
        >
          {testResult.success ? (
            <Check className="w-4 h-4" />
          ) : (
            <X className="w-4 h-4" />
          )}
          <span className="text-sm">{testResult.message}</span>
        </div>
      )}
    </div>
  )
}
