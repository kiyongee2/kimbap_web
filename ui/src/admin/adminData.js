import menuData from '../data/menuData'

// 메뉴 목록 초기 상태 (기존 고객용 데이터 공유)
export const initialMenus = menuData.map((m) => ({ ...m }))

// 대시보드 KPI 목업
export const dashboardKpi = {
  qrScans: { value: 234, change: 12.5 },
  orders:  { value: 67,  change: -3.2 },
  topLang: { name: '영어', percent: 42 },
  popular: { name: '참치김밥', orders: 28, emoji: '🐟' },
}

// 최근 활동 목업
export const recentActivities = [
  { id: 1, type: 'order',    title: '새 주문 접수 #1024', sub: '참치김밥 x1',             time: '2분 전'   },
  { id: 2, type: 'qr',       title: 'QR 스캔',            sub: '테이블 QR — 4번 테이블',  time: '5분 전'   },
  { id: 3, type: 'menu',     title: '메뉴 업데이트',       sub: '소불고기김밥 가격 변경',  time: '1시간 전' },
  { id: 4, type: 'location', title: '정문 QR 스캔',        sub: '외국인 방문객 접속',      time: '2시간 전' },
  { id: 5, type: 'order',    title: '새 주문 접수 #1023',  sub: '클래식김밥 x2, 라면 x1', time: '3시간 전' },
]

// 통계 목업
export const statsData = {
  language: [
    { name: '영어',   percent: 42, color: '#E8622A' },
    { name: '일본어', percent: 28, color: '#F44336' },
    { name: '중국어', percent: 18, color: '#26C6DA' },
    { name: '한국어', percent: 12, color: '#66BB6A' },
  ],
  popularMenus: [
    { name: '참치김밥',    orders: 28, emoji: '🐟' },
    { name: '클래식김밥',  orders: 21, emoji: '🍱' },
    { name: '소불고기김밥', orders: 15, emoji: '🥩' },
  ],
  qrLocation: [
    { name: '정문 QR',   percent: 55, color: '#E8622A' },
    { name: '테이블 QR', percent: 35, color: '#42A5F5' },
    { name: '기타',      percent: 10, color: '#66BB6A' },
  ],
  filterUsage: [
    { name: '돼지고기 없음', icon: '❌',  percent: 38 },
    { name: '매움',          icon: '🌶️', percent: 32 },
    { name: '비건',          icon: '🌿', percent: 18 },
    { name: '소고기 포함',   icon: '🥩', percent: 12 },
  ],
}
