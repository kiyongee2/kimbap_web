import { useState, useEffect } from 'react'
import { getOrders } from '../store/orderStore'
import { dashboardKpi, recentActivities as mockActivities } from './adminData'

function formatRelativeTime(isoString) {
  const diff = (Date.now() - new Date(isoString).getTime()) / 1000
  if (diff < 60)    return '방금 전'
  if (diff < 3600)  return `${Math.floor(diff / 60)}분 전`
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`
  return `${Math.floor(diff / 86400)}일 전`
}

const ACTIVITY_META = {
  order:    { icon: '🛍️', color: '#E8622A' },
  qr:       { icon: '📱', color: '#42A5F5' },
  menu:     { icon: '✏️', color: '#4CAF50' },
  location: { icon: '📍', color: '#AB47BC' },
}

function isTodayKST(isoString) {
  const d   = new Date(isoString)
  const kst = new Date(d.toLocaleString('en-US', { timeZone: 'Asia/Seoul' }))
  const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Seoul' }))
  return (
    kst.getFullYear() === now.getFullYear() &&
    kst.getMonth()    === now.getMonth()    &&
    kst.getDate()     === now.getDate()
  )
}

export default function Dashboard() {
  const [todayCount,   setTodayCount]   = useState(0)
  const [recentOrders, setRecentOrders] = useState([])

  // 5초 폴링으로 API 데이터 갱신
  useEffect(() => {
    const refresh = async () => {
      try {
        const all = await getOrders()
        const sorted = [...all].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        setTodayCount(sorted.filter((o) => isTodayKST(o.createdAt)).length)
        setRecentOrders(sorted.slice(0, 5))
      } catch (err) {
        console.error('대시보드 데이터 조회 오류:', err)
      }
    }
    refresh()
    const interval = setInterval(refresh, 5000)
    return () => clearInterval(interval)
  }, [])

  const { qrScans, topLang, popular } = dashboardKpi

  // 실제 주문을 활동 목록으로 변환
  const orderActivities = recentOrders.map((o) => ({
    id:    `order-${o.id}`,
    type:  'order',
    title: `새 주문 접수 ${o.orderNumber || '#' + o.id}`,
    sub:   (o.items || [])
             .map((i) => `${i.menuName || '메뉴'} x${i.quantity}`)
             .join(', '),
    time:  formatRelativeTime(o.createdAt),
  }))

  // 실제 주문이 없으면 목업 활동으로 채움
  const mockNonOrder = mockActivities.filter((a) => a.type !== 'order')
  const activities   = [...orderActivities, ...mockNonOrder].slice(0, 5)

  return (
    <div className="admin-screen">
      {/* 헤더 */}
      <header className="admin-header">
        <button className="admin-icon-btn" aria-label="메뉴">☰</button>
        <div className="admin-header-brand">
          <span>🏪</span>
          <span>명동김밥 관리자</span>
        </div>
        <button className="admin-icon-btn admin-notif-btn" aria-label="알림">
          🔔
          {todayCount > 0 && <span className="admin-notif-badge" aria-hidden="true" />}
        </button>
      </header>

      <div className="admin-body">
        {/* KPI 카드 2×2 */}
        <div className="admin-kpi-grid">
          {/* 오늘 QR 접속 (목업) */}
          <div className="admin-kpi-card">
            <p className="admin-kpi-label">오늘 QR 접속</p>
            <p className="admin-kpi-value">{qrScans.value.toLocaleString()}</p>
            <p className={`admin-kpi-change ${qrScans.change >= 0 ? 'positive' : 'negative'}`}>
              {qrScans.change >= 0 ? '▲' : '▼'} {Math.abs(qrScans.change)}%
            </p>
          </div>

          {/* 오늘 주문 — localStorage 실데이터 */}
          <div className="admin-kpi-card">
            <p className="admin-kpi-label">오늘 주문</p>
            <p className="admin-kpi-value">{todayCount}</p>
            <p className="admin-kpi-change neutral">
              {todayCount > 0 ? '실시간 업데이트' : '아직 없음'}
            </p>
          </div>

          {/* 주요 언어 (목업) */}
          <div className="admin-kpi-card">
            <p className="admin-kpi-label">주요 언어</p>
            <p className="admin-kpi-value" style={{ fontSize: 22 }}>{topLang.name}</p>
            <p className="admin-kpi-change neutral">{topLang.percent}% 접속</p>
          </div>

          {/* 인기 메뉴 (목업) */}
          <div className="admin-kpi-card">
            <p className="admin-kpi-label">인기 메뉴</p>
            <p className="admin-kpi-popular-emoji">{popular.emoji}</p>
            <p className="admin-kpi-popular-name">{popular.name}</p>
            <p className="admin-kpi-change neutral">{popular.orders}건</p>
          </div>
        </div>

        {/* 최근 활동 */}
        <div className="admin-section">
          <div className="admin-section-header">
            <h2 className="admin-section-title">최근 활동</h2>
            <button className="admin-link-btn">전체 보기</button>
          </div>
          {activities.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, textAlign: 'center', padding: '12px 0' }}>
              아직 활동이 없습니다
            </p>
          ) : (
            <div className="admin-activity-list">
              {activities.map((act) => {
                const meta = ACTIVITY_META[act.type] || ACTIVITY_META.order
                return (
                  <div key={act.id} className="admin-activity-item">
                    <span
                      className="admin-activity-icon"
                      style={{ background: meta.color + '22', color: meta.color }}
                    >
                      {meta.icon}
                    </span>
                    <div className="admin-activity-text">
                      <p className="admin-activity-title">{act.title}</p>
                      <p className="admin-activity-sub">{act.sub}</p>
                    </div>
                    <span className="admin-activity-time">{act.time}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
