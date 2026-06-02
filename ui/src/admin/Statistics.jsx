import { statsData } from './adminData'

/**
 * SVG 도넛 차트 컴포넌트
 * 각 세그먼트를 개별 <circle>의 stroke-dasharray로 표현한다.
 * rotate(cumDeg - 90) 으로 12시 방향부터 시계 방향 정렬.
 */
function DonutChart({ segments }) {
  const r  = 45
  const cx = 60
  const cy = 60
  const C  = 2 * Math.PI * r // ≈ 282.74

  let cumPct = 0

  return (
    <svg width="120" height="120" viewBox="0 0 120 120" aria-hidden="true">
      {/* 배경 트랙 */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#EDEDED" strokeWidth="14" />

      {segments.map((seg, i) => {
        const len      = C * (seg.percent / 100)
        const rotation = (cumPct / 100) * 360 - 90
        cumPct += seg.percent

        return (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={seg.color}
            strokeWidth="14"
            strokeDasharray={`${len} ${C}`}
            strokeDashoffset={0}
            strokeLinecap="butt"
            transform={`rotate(${rotation} ${cx} ${cy})`}
          />
        )
      })}
    </svg>
  )
}

export default function Statistics() {
  const { language, popularMenus, qrLocation, filterUsage } = statsData
  const maxOrders = popularMenus[0].orders

  return (
    <div className="admin-screen">
      {/* 헤더 */}
      <header className="admin-header">
        <button className="admin-icon-btn" aria-label="메뉴">☰</button>
        <h1 className="admin-header-center">통계</h1>
        <button className="admin-icon-btn" aria-label="날짜 선택">📅</button>
      </header>

      <div className="admin-body">
        {/* 섹션 1: 언어별 접속 현황 */}
        <div className="admin-stats-card">
          <h2 className="admin-stats-title">언어별 접속 현황</h2>
          <div className="admin-donut-row">
            <DonutChart segments={language} />
            <div className="admin-legend">
              {language.map((item, i) => (
                <div key={i} className="admin-legend-item">
                  <span className="admin-legend-dot" style={{ background: item.color }} />
                  <span className="admin-legend-name">{item.name}</span>
                  <span className="admin-legend-pct">{item.percent}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 섹션 2: 인기 메뉴 TOP */}
        <div className="admin-stats-card">
          <h2 className="admin-stats-title">인기 메뉴 TOP</h2>
          {popularMenus.map((menu, i) => (
            <div key={i} className="admin-popular-row">
              <span className="admin-popular-rank">{i + 1}</span>
              <span className="admin-popular-emoji">{menu.emoji}</span>
              <div className="admin-popular-info">
                <p className="admin-popular-name">{menu.name}</p>
                <div className="admin-popular-bar">
                  <div
                    className="admin-popular-bar-fill"
                    style={{ width: `${(menu.orders / maxOrders) * 100}%` }}
                  />
                </div>
              </div>
              <span className="admin-popular-count">{menu.orders}건</span>
            </div>
          ))}
        </div>

        {/* 섹션 3: QR 위치별 접속 */}
        <div className="admin-stats-card">
          <h2 className="admin-stats-title">QR 위치별 접속</h2>
          <div className="admin-donut-row">
            <DonutChart segments={qrLocation} />
            <div className="admin-legend">
              {qrLocation.map((item, i) => (
                <div key={i} className="admin-legend-item">
                  <span className="admin-legend-dot" style={{ background: item.color }} />
                  <span className="admin-legend-name">{item.name}</span>
                  <span className="admin-legend-pct">{item.percent}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 섹션 4: 필터 사용 비율 */}
        <div className="admin-stats-card">
          <h2 className="admin-stats-title">필터 사용 비율</h2>
          <div className="admin-filter-usage">
            {filterUsage.map((item, i) => (
              <div key={i} className="admin-filter-badge">
                <span aria-hidden="true">{item.icon}</span>
                <span className="admin-filter-name">{item.name}</span>
                <span className="admin-filter-pct">{item.percent}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
