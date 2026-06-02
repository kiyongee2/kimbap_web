import { useState } from 'react';
import translations from '../i18n';

function OrderSummary({ lang, cart, onUpdateCart, onClearCart, onBack, onSave, onConfirm }) {
  const t = translations[lang];
  const [showDialog, setShowDialog] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleConfirm = () => {
    onSave();              // 주문 즉시 저장 (setTimeout 외부에서 호출)
    setConfirmed(true);
    setTimeout(() => {
      onConfirm();         // 애니메이션 후 화면 전환
    }, 2800);
  };

  if (confirmed) {
    return (
      <div className="order-screen confirmed">
        <div className="confirm-anim">
          <div className="confirm-circle">✓</div>
          <h2>{t.orderConfirmed}</h2>
          <p>{t.thankYou}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="order-screen">
      {/* Header */}
      <header className="order-header">
        <button className="icon-btn" onClick={onBack}>←</button>
        <h2>{t.yourOrder}</h2>
        {cart.length > 0 && (
          <button className="icon-btn clear-icon" onClick={() => setShowDialog(true)}>
            🗑️
          </button>
        )}
        {cart.length === 0 && <span style={{ width: 40 }} />}
      </header>

      {cart.length === 0 ? (
        /* Empty State */
        <div className="empty-cart">
          <span className="empty-icon">🛍️</span>
          <p className="empty-title">{t.emptyCart}</p>
          <p className="empty-sub">{t.addItems}</p>
          <button className="back-to-menu-btn" onClick={onBack}>
            ← {t.menu}
          </button>
        </div>
      ) : (
        <>
          {/* Items */}
          <div className="order-list">
            {cart.map((item) => (
              <div key={item.id} className="order-item">
                <div className="order-item-img" style={{ backgroundColor: item.bgColor }}>
                  {item.emoji}
                </div>
                <div className="order-item-info">
                  <p className="order-item-name">{item.name[lang]}</p>
                  <div className="order-item-qty">
                    <button className="qty-sm-btn" onClick={() => onUpdateCart(item.id, -1)}>
                      −
                    </button>
                    <span>{item.quantity}</span>
                    <button className="qty-sm-btn" onClick={() => onUpdateCart(item.id, 1)}>
                      +
                    </button>
                  </div>
                </div>
                <span className="order-item-price">
                  ₩{(item.price * item.quantity).toLocaleString()}
                </span>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="order-total">
            <span>{t.total}</span>
            <span className="order-total-value">₩{total.toLocaleString()}</span>
          </div>

          {/* Staff Panel */}
          <div className="staff-panel">
            <div className="staff-panel-header">
              <span>👨‍💼</span>
              <span>{t.showToStaff}</span>
            </div>
            <div className="staff-panel-body">
              {cart.map((item) => (
                <div key={item.id} className="staff-item-kr">
                  {item.krName}&nbsp;{item.quantity}개
                </div>
              ))}
            </div>
          </div>

          {/* Confirm Button */}
          <div className="order-footer">
            <button className="confirm-btn" onClick={handleConfirm}>
              ✓&nbsp;&nbsp;{t.confirm}
            </button>
          </div>
        </>
      )}

      {/* Clear All Dialog */}
      {showDialog && (
        <div className="dialog-overlay" onClick={() => setShowDialog(false)}>
          <div className="dialog" onClick={(e) => e.stopPropagation()}>
            <p>{t.clearAll}?</p>
            <div className="dialog-btns">
              <button onClick={() => setShowDialog(false)}>Cancel</button>
              <button
                className="dialog-confirm"
                onClick={() => {
                  onClearCart();
                  setShowDialog(false);
                }}
              >
                {t.clearAll}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrderSummary;
