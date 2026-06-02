import { useState } from 'react'
import Dashboard from './Dashboard'
import MenuManagement from './MenuManagement'
import MenuEdit from './MenuEdit'
import OrderList from './OrderList'
import Statistics from './Statistics'
import AdminSettings from './AdminSettings'
import { initialMenus } from './adminData'
import './admin.css'

const TABS = {
  DASHBOARD: 'dashboard',
  MENUS:     'menus',
  ORDERS:    'orders',
  STATS:     'stats',
  SETTINGS:  'settings',
}

const NAV_ITEMS = [
  { key: TABS.DASHBOARD, icon: '⊞', label: '대시보드' },
  { key: TABS.MENUS,     icon: '🍽️', label: '메뉴' },
  { key: TABS.ORDERS,    icon: '🛍️', label: '주문' },
  { key: TABS.STATS,     icon: '📊', label: '통계' },
  { key: TABS.SETTINGS,  icon: '⚙️', label: '설정' },
]

export default function AdminApp() {
  const [tab, setTab]           = useState(TABS.DASHBOARD)
  const [menus, setMenus]       = useState(initialMenus)
  const [editTarget, setEditTarget] = useState(undefined) // undefined=숨김, null=신규, object=수정
  const [toast, setToast]       = useState(null)
  const [toastTimer, setToastTimer] = useState(null)

  const showToast = (message, type = 'success') => {
    if (toastTimer) clearTimeout(toastTimer)
    setToast({ message, type })
    const t = setTimeout(() => setToast(null), 2500)
    setToastTimer(t)
  }

  const openEdit  = (item = null) => setEditTarget(item)
  const closeEdit = () => setEditTarget(undefined)

  const handleSaveMenu = (data) => {
    if (data.id) {
      setMenus((prev) => prev.map((m) => (m.id === data.id ? data : m)))
    } else {
      setMenus((prev) => [...prev, { ...data, id: Date.now() }])
    }
    showToast('저장되었습니다')
    closeEdit()
  }

  const handleDeleteMenu = (id) => {
    setMenus((prev) => prev.filter((m) => m.id !== id))
    showToast('삭제되었습니다')
    closeEdit()
  }

  // 메뉴 편집 화면은 하단 네비 없이 단독 화면으로 표시
  if (editTarget !== undefined) {
    return (
      <div className="admin-app">
        <MenuEdit
          item={editTarget}
          onBack={closeEdit}
          onSave={handleSaveMenu}
          onDelete={handleDeleteMenu}
          showToast={showToast}
        />
        {toast && (
          <div className={`admin-toast admin-toast--${toast.type}`}>
            {toast.type === 'success' ? '✓' : '✕'} {toast.message}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="admin-app">
      {/* 탭별 화면 */}
      {tab === TABS.DASHBOARD && <Dashboard />}
      {tab === TABS.MENUS && (
        <MenuManagement menus={menus} onEditMenu={openEdit} />
      )}
      {tab === TABS.ORDERS && <OrderList />}
      {tab === TABS.STATS && <Statistics />}
      {tab === TABS.SETTINGS && <AdminSettings showToast={showToast} />}

      {/* 토스트 */}
      {toast && (
        <div className={`admin-toast admin-toast--${toast.type}`}>
          {toast.type === 'success' ? '✓' : '✕'} {toast.message}
        </div>
      )}

      {/* 하단 네비게이션 */}
      <nav className="admin-nav">
        {NAV_ITEMS.map(({ key, icon, label }) => (
          <button
            key={key}
            className={`admin-nav-item ${tab === key ? 'active' : ''}`}
            onClick={() => setTab(key)}
          >
            <span className="admin-nav-icon">{icon}</span>
            <span className="admin-nav-label">{label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
