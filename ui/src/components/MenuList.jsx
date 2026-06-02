import { useState } from 'react';
import translations from '../i18n';

const TAG_CONFIG = {
  vegan:   { icon: '🌿', color: '#2E7D32', bg: '#E8F5E9' },
  noPork:  { icon: '🚫', color: '#C62828', bg: '#FFEBEE' },
  beef:    { icon: '🥩', color: '#4E342E', bg: '#EFEBE9' },
  spicy:   { icon: '🌶️', color: '#E53935', bg: '#FFEBEE' },
  popular: { icon: '⭐', color: '#F57F17', bg: '#FFFDE7' },
};

function MenuList({ lang, cart, menuData, onSelectMenu, onOpenOrder, onChangeLang }) {
  const t = translations[lang];
  const [search, setSearch] = useState('');
  const [activeFilters, setActiveFilters] = useState([]);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const toggleFilter = (key) => {
    setActiveFilters((prev) =>
      prev.includes(key) ? prev.filter((f) => f !== key) : [...prev, key]
    );
  };

  const filtered = menuData.filter((item) => {
    const q = search.toLowerCase();
    const nameMatch =
      item.name[lang].toLowerCase().includes(q) ||
      item.description[lang].toLowerCase().includes(q);
    const tagMatch =
      activeFilters.length === 0 || activeFilters.every((f) => item.dietary[f]);
    return nameMatch && tagMatch;
  });

  return (
    <div className="menu-screen">
      {/* Header */}
      <header className="menu-header">
        <span className="menu-header-brand">🍱 Myeongdong Kimbap</span>
        <button className="lang-change-btn" onClick={onChangeLang}>
          🌐&nbsp;{lang.toUpperCase()}
        </button>
      </header>

      {/* Search */}
      <div className="search-bar">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          placeholder={t.searchPlaceholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
        {search && (
          <button className="search-clear" onClick={() => setSearch('')}>
            ✕
          </button>
        )}
      </div>

      {/* Filter Tags */}
      <div className="filter-tags">
        {Object.entries(TAG_CONFIG).map(([key, cfg]) => {
          const isActive = activeFilters.includes(key);
          return (
            <button
              key={key}
              className={`filter-tag${isActive ? ' active' : ''}`}
              style={
                isActive
                  ? { backgroundColor: cfg.color, borderColor: cfg.color, color: '#fff' }
                  : {}
              }
              onClick={() => toggleFilter(key)}
            >
              {cfg.icon}&nbsp;{t.filters[key]}
            </button>
          );
        })}
      </div>

      {/* Menu List */}
      <div className="menu-list">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <span style={{ fontSize: 40 }}>🔍</span>
            <p>{t.noItems}</p>
          </div>
        ) : (
          filtered.map((item) => (
            <div key={item.id} className="menu-card" onClick={() => onSelectMenu(item)}>
              <div className="menu-card-img" style={{ backgroundColor: item.bgColor }}>
                <span>{item.emoji}</span>
              </div>
              <div className="menu-card-info">
                <h3 className="menu-card-name">{item.name[lang]}</h3>
                <p className="menu-card-desc">{item.description[lang]}</p>
                <div className="menu-card-tags">
                  {item.tags.map(
                    (tag) =>
                      TAG_CONFIG[tag] && (
                        <span
                          key={tag}
                          className="menu-tag"
                          style={{
                            backgroundColor: TAG_CONFIG[tag].bg,
                            color: TAG_CONFIG[tag].color,
                          }}
                        >
                          {TAG_CONFIG[tag].icon}&nbsp;{t.filters[tag]}
                        </span>
                      )
                  )}
                </div>
              </div>
              <div className="menu-card-price">₩{item.price.toLocaleString()}</div>
            </div>
          ))
        )}
      </div>

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        <button className="nav-btn active">
          <span className="nav-icon">🍽️</span>
          <span>{t.menu}</span>
        </button>
        <button className="nav-btn" onClick={onOpenOrder}>
          <span className="nav-icon-wrap">
            <span className="nav-icon">🛍️</span>
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </span>
          <span>{t.order}</span>
        </button>
        <button className="nav-btn">
          <span className="nav-icon">ℹ️</span>
          <span>{t.info}</span>
        </button>
        <button className="nav-btn" onClick={onChangeLang}>
          <span className="nav-icon">🌐</span>
          <span>{t.language}</span>
        </button>
      </nav>
    </div>
  );
}

export default MenuList;
