import { useState } from 'react'

const CATEGORIES = ['전체', '김밥', '라면', '떡볶이', '음료']

const DIET_TAG_META = {
  popular: { icon: '⭐', label: '인기',          bg: '#FFF3CD', color: '#856404' },
  noPork:  { icon: '❌', label: '돼지고기 없음', bg: '#FDECEA', color: '#C62828' },
  spicy:   { icon: '🌶️', label: '매움',         bg: '#FDECEA', color: '#C62828' },
  vegan:   { icon: '🌿', label: '비건',          bg: '#E8F5E9', color: '#2E7D32' },
  beef:    { icon: '🥩', label: '소고기',        bg: '#FBE9E7', color: '#BF360C' },
}

export default function MenuManagement({ menus, onEditMenu }) {
  const [search,   setSearch]   = useState('')
  const [category, setCategory] = useState('전체')

  const filtered = menus.filter((m) => {
    const name = (m.name?.ko || m.krName || '').toLowerCase()
    return name.includes(search.toLowerCase())
  })

  return (
    <div className="admin-screen">
      {/* 헤더 */}
      <header className="admin-header">
        <button className="admin-icon-btn" aria-label="메뉴">☰</button>
        <h1 className="admin-header-center">메뉴 관리</h1>
        <button className="admin-icon-btn" aria-label="정렬">⚙️</button>
      </header>

      <div className="admin-body">
        {/* 검색 바 */}
        <div className="admin-search-bar">
          <span className="admin-search-icon">🔍</span>
          <input
            className="admin-search-input"
            placeholder="메뉴 검색"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="메뉴 검색"
          />
          {search && (
            <button
              className="admin-icon-btn"
              style={{ fontSize: 14 }}
              onClick={() => setSearch('')}
              aria-label="검색 초기화"
            >
              ✕
            </button>
          )}
        </div>

        {/* 카테고리 필터 */}
        <div className="admin-category-scroll" role="group" aria-label="카테고리">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`admin-category-pill ${category === cat ? 'active' : ''}`}
              onClick={() => setCategory(cat)}
              aria-pressed={category === cat}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* 메뉴 목록 */}
        {filtered.length === 0 ? (
          <div className="admin-empty-state">
            <p className="admin-empty-icon">🍽️</p>
            <p className="admin-empty-text">메뉴를 추가해 주세요</p>
            <button
              className="admin-cta-btn"
              style={{ marginTop: 8, maxWidth: 200 }}
              onClick={() => onEditMenu(null)}
            >
              + 메뉴 추가하기
            </button>
          </div>
        ) : (
          <div className="admin-menu-list">
            {filtered.map((item) => (
              <div key={item.id} className="admin-menu-item">
                {/* 썸네일 */}
                <div
                  className="admin-menu-thumb"
                  style={{ background: item.bgColor || '#FFF3E0' }}
                  aria-hidden="true"
                >
                  <span style={{ fontSize: 32 }}>{item.emoji}</span>
                </div>

                {/* 메뉴 정보 */}
                <div className="admin-menu-info">
                  <p className="admin-menu-name">{item.name?.ko || item.krName}</p>
                  <div className="admin-menu-tags">
                    {Object.entries(item.dietary || {})
                      .filter(([, v]) => v)
                      .map(([key]) => {
                        const meta = DIET_TAG_META[key]
                        if (!meta) return null
                        return (
                          <span
                            key={key}
                            className="admin-diet-badge"
                            style={{ background: meta.bg, color: meta.color }}
                          >
                            {meta.icon} {meta.label}
                          </span>
                        )
                      })}
                  </div>
                  <p className="admin-menu-price">₩{item.price.toLocaleString()}</p>
                </div>

                {/* 편집 버튼 */}
                <button
                  className="admin-edit-btn"
                  onClick={() => onEditMenu(item)}
                  aria-label={`${item.name?.ko || item.krName} 편집`}
                >
                  ✏️
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 메뉴 추가 버튼 */}
      <div className="admin-footer-btn-wrap">
        <button className="admin-cta-btn" onClick={() => onEditMenu(null)}>
          + 메뉴 추가
        </button>
      </div>
    </div>
  )
}
