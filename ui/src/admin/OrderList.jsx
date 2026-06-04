import { useState, useEffect } from 'react'
import { getOrders } from '../store/orderStore'


const LANG_FLAGS = { ko: '🇰🇷', en: '🇺🇸', ja: '🇯🇵', zh: '🇨🇳' }
const LANG_NAMES = { ko: '한국어', en: 'English', ja: '日本語', zh: '中文' }

function formatDateTime(isoString) {
  return new Date(isoString).toLocaleString('ko-KR', {
    timeZone: 'Asia/Seoul',
    month:  'numeric',
    day:    'numeric',
    hour:   '2-digit',
    minute: '2-digit',
  })
}

const PAGE_SIZE = 5

export default function OrderList() {
  const [orders, setOrders] = useState([])
  const [page, setPage] = useState(1)

  const sortOrders = (data) => [...data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  useEffect(() => {
    const refresh = async () => {
      try {
        const data = await getOrders()
        setOrders(sortOrders(data))
      } catch (err) {
        console.error('주문 목록 조회 오류:', err)
      }
    }
    refresh()
    const interval = setInterval(refresh, 5000)
    return () => clearInterval(interval)
  }, [])

  const totalPages = Math.ceil(orders.length / PAGE_SIZE)
  const pagedOrders = orders.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className="admin-screen">
      <header className="admin-header">
        <div style={{ width: 40 }} />
        <h1 className="admin-header-center">주문 내역</h1>
        <button
          className="admin-icon-btn"
          onClick={async () => { try { const d = await getOrders(); setOrders(sortOrders(d)); setPage(1) } catch (e) { console.error(e) } }}
          aria-label="새로고침"
        >
          🔄
        </button>
      </header>

      <div className="admin-body">
        {orders.length === 0 ? (
          <div className="admin-empty-state">
            <p className="admin-empty-icon">🛍️</p>
            <p className="admin-empty-text">아직 주문이 없습니다</p>
            <p className="admin-empty-sub">고객 앱에서 메뉴를 주문하면 여기에 표시됩니다</p>
          </div>
        ) : (
          <>
            <div className="admin-order-list">
              {pagedOrders.map((order) => (
                <div key={order.id} className="admin-order-card">
                  {/* 주문 헤더 */}
                  <div className="admin-order-header">
                    <span className="admin-order-number">{order.orderNumber || `#${order.id}`}</span>
                    <div className="admin-order-meta">
                      <span className="admin-order-lang">
                        {LANG_FLAGS[order.language] || '🌐'}&nbsp;
                        {LANG_NAMES[order.language] || order.language}
                      </span>
                      <span className="admin-order-time">{formatDateTime(order.createdAt)}</span>
                    </div>
                  </div>

                  {/* 주문 항목 */}
                  <div className="admin-order-items">
                    {order.items.map((item, i) => (
                      <div key={i} className="admin-order-item-row">
                        <span className="admin-order-item-name">
                          {item.menuName || '메뉴'}
                        </span>
                        <span className="admin-order-item-qty">× {item.quantity}</span>
                        <span className="admin-order-item-price">
                          ₩{(item.unitPrice * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* 합계 */}
                  <div className="admin-order-total">
                    <span>합계</span>
                    <span className="admin-order-total-amount">
                      ₩{(order.totalAmount ?? 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* 페이지네이션 */}
            <div className="admin-pagination">
              <button
                className="admin-page-btn"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                ◀
              </button>
              <span className="admin-page-info">{page} / {totalPages}</span>
              <button
                className="admin-page-btn"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                ▶
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
