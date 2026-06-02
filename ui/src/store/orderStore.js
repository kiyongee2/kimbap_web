/**
 * orderStore.js
 * 백엔드 REST API(/api/orders)를 통해 주문을 저장하고 조회한다.
 */

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080'

/**
 * 고객이 주문 확정 시 호출. 백엔드 API에 주문을 POST한다.
 * @param {Array}  cart - [{ krName, price, quantity, ... }]
 * @param {string} lang - 고객이 선택한 언어 코드
 * @returns {Promise<Object>} 저장된 order 객체
 */
export async function saveOrder(cart, lang) {
  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const payload = {
    totalAmount,
    language: lang || 'ko',
    items: cart.map(({ krName, price, quantity }) => ({
      menuName: krName,
      unitPrice: price,
      quantity,
    })),
  }
  const res = await fetch(`${API_BASE}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error(`주문 저장 실패: ${res.status}`)
  return res.json()
}

/** 전체 주문 목록을 반환한다. */
export async function getOrders() {
  const res = await fetch(`${API_BASE}/api/orders`)
  if (!res.ok) throw new Error(`주문 조회 실패: ${res.status}`)
  return res.json()
}

/** 오늘 날짜의 주문만 반환한다. */
export async function getTodayOrders() {
  const res = await fetch(`${API_BASE}/api/orders?today=true`)
  if (!res.ok) throw new Error(`오늘 주문 조회 실패: ${res.status}`)
  return res.json()
}
