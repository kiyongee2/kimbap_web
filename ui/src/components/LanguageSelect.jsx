const LANGUAGES = [
  { code: 'en', flag: '🇺🇸', nativeName: 'English' },
  { code: 'ja', flag: '🇯🇵', nativeName: '日本語' },
  { code: 'zh', flag: '🇨🇳', nativeName: '中文' },
  { code: 'ko', flag: '🇰🇷', nativeName: '한국어' },
];

function LanguageSelect({ onSelectLanguage }) {
  return (
    <div className="lang-screen">
      <div className="lang-brand">
        <span className="lang-logo">🍱</span>
        <h1 className="lang-title">Myeongdong Kimbap</h1>
        <p className="lang-subtitle">
          Welcome&nbsp;&nbsp;•&nbsp;&nbsp;어서오세요&nbsp;&nbsp;•&nbsp;&nbsp;ようこそ&nbsp;&nbsp;•&nbsp;&nbsp;欢迎
        </p>
      </div>

      <div className="lang-select-section">
        <p className="lang-prompt">Please select your language</p>
        <div className="lang-buttons">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              className="lang-btn"
              onClick={() => onSelectLanguage(lang.code)}
            >
              <span className="lang-flag">{lang.flag}</span>
              <span className="lang-name">{lang.nativeName}</span>
              <span className="lang-arrow">›</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default LanguageSelect;
