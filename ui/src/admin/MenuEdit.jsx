import { useState } from 'react'

const DIET_ITEMS = [
  { key: 'vegan',   icon: '🌿', label: '비건' },
  { key: 'noPork',  icon: '❌', label: '돼지고기 없음' },
  { key: 'beef',    icon: '🥩', label: '소고기 포함' },
  { key: 'spicy',   icon: '🌶️', label: '매움' },
  { key: 'popular', icon: '⭐', label: '인기 메뉴' },
]

const ALLOWED_TYPES = ['image/png', 'image/jpeg']
const MAX_SIZE_BYTES = 5 * 1024 * 1024

export default function MenuEdit({ item, onBack, onSave, onDelete, showToast }) {
  const isNew = !item

  const [form, setForm] = useState({
    ko:      item?.name?.ko || '',
    en:      item?.name?.en || '',
    ja:      item?.name?.ja || '',
    zh:      item?.name?.zh || '',
    price:   item?.price?.toString() || '',
    dietary: {
      vegan:   item?.dietary?.vegan   ?? false,
      noPork:  item?.dietary?.noPork  ?? false,
      beef:    item?.dietary?.beef    ?? false,
      spicy:   item?.dietary?.spicy   ?? false,
      popular: item?.dietary?.popular ?? false,
    },
    emoji:   item?.emoji   || '🍱',
    bgColor: item?.bgColor || '#FFF3E0',
  })

  const [imagePreview, setImagePreview] = useState(null)
  const [dirty, setDirty]               = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showBackDialog,   setShowBackDialog]   = useState(false)

  const update = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }))
    setDirty(true)
  }

  const toggleDiet = (key) => {
    setForm((f) => ({
      ...f,
      dietary: { ...f.dietary, [key]: !f.dietary[key] },
    }))
    setDirty(true)
  }

  const handleImage = (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (!ALLOWED_TYPES.includes(file.type)) {
      showToast('PNG, JPG 파일만 업로드 가능합니다', 'error')
      return
    }
    if (file.size > MAX_SIZE_BYTES) {
      showToast('파일 크기는 5MB 이하여야 합니다', 'error')
      return
    }

    const reader = new FileReader()
    reader.onload = (ev) => setImagePreview(ev.target.result)
    reader.readAsDataURL(file)
    setDirty(true)
    // 보안: value 초기화로 같은 파일 재선택 허용
    e.target.value = ''
  }

  const handleBack = () => {
    if (dirty) setShowBackDialog(true)
    else onBack()
  }

  const handleSave = () => {
    // 한국어 필드 필수 검증
    const koName = form.ko.trim()
    if (!koName) return

    // 가격 유효성 (음수 차단)
    const price = Math.max(0, parseInt(form.price) || 0)

    const data = {
      ...(item || {}),
      name: {
        ko: koName,
        en: form.en.trim(),
        ja: form.ja.trim(),
        zh: form.zh.trim(),
      },
      krName:  koName,
      price,
      dietary: { ...form.dietary },
      emoji:   form.emoji,
      bgColor: form.bgColor,
      tags:    Object.entries(form.dietary)
                     .filter(([, v]) => v)
                     .map(([k]) => k),
    }
    onSave(data)
  }

  const isValid = form.ko.trim().length > 0

  return (
    <div className="admin-screen">
      {/* 헤더 */}
      <header className="admin-header">
        <button className="admin-icon-btn" onClick={handleBack} aria-label="뒤로">←</button>
        <h1 className="admin-header-center">{isNew ? '메뉴 추가' : '메뉴 수정'}</h1>
        {!isNew ? (
          <button
            className="admin-icon-btn"
            onClick={() => setShowDeleteDialog(true)}
            aria-label="삭제"
          >
            🗑
          </button>
        ) : (
          <div style={{ width: 40 }} />
        )}
      </header>

      {/* 폼 바디 */}
      <div className="admin-body admin-body--form">
        {/* 이미지 업로드 */}
        <label className="admin-image-upload" aria-label="이미지 업로드 (클릭)">
          {imagePreview ? (
            <img src={imagePreview} alt="메뉴 미리보기" className="admin-image-preview" />
          ) : (
            <div className="admin-image-placeholder">
              <span className="admin-image-emoji">{form.emoji}</span>
              <p className="admin-image-hint">이미지 업로드</p>
              <p className="admin-image-hint-sub">PNG, JPG (최대 5MB)</p>
            </div>
          )}
          <input
            type="file"
            accept="image/png,image/jpeg"
            hidden
            onChange={handleImage}
          />
        </label>

        {/* 다국어 이름 */}
        <div className="admin-form-section">
          {[
            { lang: 'ko', label: '한국어', placeholder: '클래식김밥', required: true },
            { lang: 'en', label: '영어',   placeholder: 'Classic Gimbap' },
            { lang: 'ja', label: '일본어', placeholder: 'クラシック海苔巻き' },
            { lang: 'zh', label: '중국어', placeholder: '经典紫菜饭卷' },
          ].map(({ lang, label, placeholder, required }) => (
            <div key={lang} className="admin-form-field">
              <label className="admin-form-label" htmlFor={`field-${lang}`}>
                {label}
                {required && <span className="admin-required" aria-hidden="true">*</span>}
              </label>
              <input
                id={`field-${lang}`}
                className="admin-form-input"
                placeholder={placeholder}
                value={form[lang]}
                onChange={(e) => update(lang, e.target.value)}
                aria-required={required || false}
              />
            </div>
          ))}
        </div>

        {/* 가격 */}
        <div className="admin-form-section">
          <div className="admin-form-field">
            <label className="admin-form-label" htmlFor="field-price">가격(원)</label>
            <div className="admin-price-wrap">
              <span className="admin-price-prefix">₩</span>
              <input
                id="field-price"
                className="admin-form-input admin-price-input"
                type="number"
                min="0"
                placeholder="0"
                value={form.price}
                onChange={(e) => update('price', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* 식단 정보 토글 */}
        <div className="admin-form-section">
          <p className="admin-form-section-title">식단 정보</p>
          {DIET_ITEMS.map(({ key, icon, label }) => (
            <div key={key} className="admin-toggle-row">
              <div className="admin-toggle-label">
                <span aria-hidden="true">{icon}</span>
                <span>{label}</span>
              </div>
              <button
                role="switch"
                aria-checked={form.dietary[key]}
                aria-label={label}
                className={`admin-toggle ${form.dietary[key] ? 'on' : 'off'}`}
                onClick={() => toggleDiet(key)}
              >
                <span className="admin-toggle-thumb" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 저장 버튼 */}
      <div className="admin-footer-btn-wrap">
        <button
          className="admin-cta-btn"
          onClick={handleSave}
          disabled={!isValid}
          style={{ opacity: isValid ? 1 : 0.4 }}
        >
          {isNew ? '메뉴 등록' : '변경사항 저장'}
        </button>
      </div>

      {/* 삭제 확인 다이얼로그 */}
      {showDeleteDialog && (
        <div className="admin-overlay" role="dialog" aria-modal="true" aria-labelledby="del-title">
          <div className="admin-dialog">
            <h3 id="del-title" className="admin-dialog-title">메뉴 삭제</h3>
            <p className="admin-dialog-body">이 메뉴를 삭제하시겠습니까?</p>
            <div className="admin-dialog-actions">
              <button className="admin-dialog-cancel" onClick={() => setShowDeleteDialog(false)}>
                취소
              </button>
              <button
                className="admin-dialog-confirm admin-dialog-confirm--danger"
                onClick={() => onDelete(item.id)}
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 뒤로가기 확인 다이얼로그 */}
      {showBackDialog && (
        <div className="admin-overlay" role="dialog" aria-modal="true" aria-labelledby="back-title">
          <div className="admin-dialog">
            <h3 id="back-title" className="admin-dialog-title">변경사항 취소</h3>
            <p className="admin-dialog-body">변경사항을 저장하지 않고 나가시겠습니까?</p>
            <div className="admin-dialog-actions">
              <button className="admin-dialog-cancel" onClick={() => setShowBackDialog(false)}>
                머물기
              </button>
              <button className="admin-dialog-confirm" onClick={onBack}>
                나가기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
