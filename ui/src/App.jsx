import { useState } from 'react'
import LanguageSelect from './components/LanguageSelect'
import MenuList from './components/MenuList'
import MenuDetail from './components/MenuDetail'
import OrderSummary from './components/OrderSummary'
import menuData from './data/menuData'
import { saveOrder } from './store/orderStore'
import './App.css'

const SCREENS = { LANGUAGE: 'language', MENU: 'menu', DETAIL: 'detail', ORDER: 'order' }

function App() {
  const [screen, setScreen] = useState(SCREENS.LANGUAGE)
  const [lang, setLang] = useState(() => localStorage.getItem('kimbap_lang') || 'en')
  const [selectedMenu, setSelectedMenu] = useState(null)
  const [cart, setCart] = useState([])

  const handleSelectLanguage = (code) => {
    setLang(code)
    localStorage.setItem('kimbap_lang', code)
    setScreen(SCREENS.MENU)
  }

  const handleSelectMenu = (item) => {
    setSelectedMenu(item)
    setScreen(SCREENS.DETAIL)
  }

  const handleAddToCart = (item, quantity) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === item.id)
      if (existing) {
        return prev.map((c) =>
          c.id === item.id ? { ...c, quantity: Math.min(99, c.quantity + quantity) } : c
        )
      }
      return [...prev, { ...item, quantity }]
    })
  }

  const handleUpdateCart = (id, delta) => {
    setCart((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity: item.quantity + delta } : item))
          .filter((item) => item.quantity > 0)
    )
  }

  const handleSaveOrder = async () => {
    try {
      await saveOrder(cart, lang)
    } catch (err) {
      console.error('주문 저장 오류:', err)
    }
  }

  const handleConfirmOrder = () => {
    setCart([])
    setScreen(SCREENS.MENU)
  }

  return (
    <div className="app">
      {screen === SCREENS.LANGUAGE && (
        <LanguageSelect onSelectLanguage={handleSelectLanguage} />
      )}
      {screen === SCREENS.MENU && (
        <MenuList
          lang={lang}
          cart={cart}
          menuData={menuData}
          onSelectMenu={handleSelectMenu}
          onOpenOrder={() => setScreen(SCREENS.ORDER)}
          onChangeLang={() => setScreen(SCREENS.LANGUAGE)}
        />
      )}
      {screen === SCREENS.DETAIL && selectedMenu && (
        <MenuDetail
          item={selectedMenu}
          lang={lang}
          onBack={() => setScreen(SCREENS.MENU)}
          onAddToCart={(item, qty) => {
            handleAddToCart(item, qty)
            setScreen(SCREENS.ORDER)
          }}
        />
      )}
      {screen === SCREENS.ORDER && (
        <OrderSummary
          lang={lang}
          cart={cart}
          onUpdateCart={handleUpdateCart}
          onClearCart={() => setCart([])}
          onBack={() => setScreen(SCREENS.MENU)}
          onSave={handleSaveOrder}
          onConfirm={handleConfirmOrder}
        />
      )}
    </div>
  )
}

export default App
