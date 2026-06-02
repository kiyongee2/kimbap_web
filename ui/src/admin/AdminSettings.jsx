export default function AdminSettings({ showToast }) {
  return (
    <div className="admin-screen">
      {/* 헤더 */}
      <header className="admin-header">
        <button className="admin-icon-btn" aria-label="메뉴">☰</button>
        <h1 className="admin-header-center">설정</h1>
        <div style={{ width: 40 }} />
      </header>

      <div className="admin-body">
        {/* 매장 정보 */}
        <div className="admin-settings-card">
          <h2 className="admin-settings-section-title">매장 정보</h2>
          <div className="admin-settings-row">
            <span className="admin-settings-label">매장명</span>
            <span className="admin-settings-value">명동김밥</span>
          </div>
          <div className="admin-settings-row">
            <span className="admin-settings-label">위치</span>
            <span className="admin-settings-value">서울 중구 명동</span>
          </div>
          <div className="admin-settings-row">
            <span className="admin-settings-label">플랫폼</span>
            <span className="admin-settings-value">Nirvana DX</span>
          </div>
        </div>

        {/* 계정 */}
        <div className="admin-settings-card">
          <h2 className="admin-settings-section-title">계정</h2>
          <div className="admin-settings-row">
            <span className="admin-settings-label">권한</span>
            <span className="admin-role-badge">관리자</span>
          </div>
          <div className="admin-settings-row">
            <span className="admin-settings-label">세션 만료</span>
            <span className="admin-settings-value">24시간 비활동 시 자동 로그아웃</span>
          </div>
        </div>

        {/* 앱 정보 */}
        <div className="admin-settings-card">
          <h2 className="admin-settings-section-title">앱 정보</h2>
          <div className="admin-settings-row">
            <span className="admin-settings-label">버전</span>
            <span className="admin-settings-value">v1.0.0</span>
          </div>
          <div className="admin-settings-row">
            <span className="admin-settings-label">대상 플랫폼</span>
            <span className="admin-settings-value">모바일 웹 (PWA)</span>
          </div>
        </div>

        {/* 로그아웃 */}
        <button
          className="admin-cta-btn admin-cta-btn--danger"
          onClick={() => showToast('로그아웃 기능은 v1.1에서 제공됩니다', 'error')}
        >
          로그아웃
        </button>
      </div>
    </div>
  )
}
