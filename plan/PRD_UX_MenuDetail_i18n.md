# PRD: 메뉴 상세 UX 개선 및 다국어 식단 정보

**프로젝트**: 명동김밥 주문 앱  
**작성일**: 2026-06-04  
**대상 파일**: `ui/src/components/MenuDetail.jsx`, `ui/src/App.jsx`, `ui/src/i18n.js`, `ui/src/App.css`, `ui/src/admin/Dashboard.jsx`

---

## 1. 배경 및 목적

고객용 메뉴 상세 화면과 관리자 대시보드에서 발견된 UX/데이터 문제를 수정하여  
사용자 흐름 일관성 향상 및 다국어 사용자 경험 개선을 목표로 한다.

---

## 2. 요구사항

### 2.1 뒤로가기 버튼 — 목록 형태로 변경 (DETAIL-NAV-01)

| 항목 | 내용 |
|------|------|
| 기능 ID | DETAIL-NAV-01 |
| 우선순위 | 높음 |
| 대상 화면 | 메뉴 상세 화면 (`MenuDetail`) |

**변경 전**  
헤더 좌측에 `←` 아이콘 버튼만 표시.

**변경 후**  
`← 목록` (한국어), `← List` (영어), `← 一覧` (일본어), `← 列表` (중국어) 텍스트 버튼으로 변경.

**수용 기준**
- 버튼 클릭 시 메뉴 목록 화면(`SCREENS.MENU`)으로 이동한다.
- 버튼 텍스트는 현재 선택 언어에 따라 번역된 텍스트를 표시한다.
- `back-to-list-btn` CSS 클래스로 주황색 텍스트, 둥근 배경 스타일을 적용한다.

**i18n 매핑**

| 언어 | 변경 전 | 변경 후 |
|------|---------|---------|
| 한국어 | 뒤로 | ← 목록 |
| English | Back | ← List |
| 日本語 | 戻る | ← 一覧 |
| 中文 | 返回 | ← 列表 |

---

### 2.2 주문 추가 후 주문 화면 자동 이동 (DETAIL-CART-01)

| 항목 | 내용 |
|------|------|
| 기능 ID | DETAIL-CART-01 |
| 우선순위 | 높음 |
| 대상 화면 | 메뉴 상세 화면 → 주문 화면 |

**변경 전**  
"주문에 추가" 버튼 클릭 시 토스트 메시지만 2초 표시 후 현재 화면 유지.

**변경 후**  
"주문에 추가" 버튼 클릭 시 장바구니에 추가 후 즉시 주문 화면(`SCREENS.ORDER`)으로 이동.

**수용 기준**
- `onAddToCart(item, qty)` 호출 후 `setScreen(SCREENS.ORDER)` 실행된다.
- 토스트 메시지(`toast` state)는 불필요하므로 제거한다.
- 중복 메뉴 추가 시에도 수량이 정상 누산된 후 주문 화면으로 이동한다.

---

### 2.3 식단 정보 다국어 번역 (DETAIL-DIET-01)

| 항목 | 내용 |
|------|------|
| 기능 ID | DETAIL-DIET-01 |
| 우선순위 | 중간 |
| 대상 화면 | 메뉴 상세 화면 — 식단 정보 뱃지 |

**변경 전**  
알레르겐(Fish, Egg, Dairy, Shellfish) 및 dietary 뱃지(Spicy, Not Spicy, No Pork, Vegan)가 영어 하드코딩 텍스트로 고정 표시.

**변경 후**  
`i18n.js`의 `allergens`, `dietary` 번역 키를 추가하여 선택 언어에 맞는 텍스트를 표시.

**수용 기준**
- 알레르겐 4종(fish, egg, dairy, shellfish)이 선택 언어로 표시된다.
- dietary 뱃지 4종(spicy, notSpicy, noPork, vegan)이 선택 언어로 표시된다.
- 번역 키 누락 시 영어 fallback 텍스트를 표시한다.

**번역 테이블 — 알레르겐**

| 키 | 한국어 | English | 日本語 | 中文 |
|----|--------|---------|--------|------|
| fish | 생선 | Fish | 魚 | 鱼 |
| egg | 달걀 | Egg | 卵 | 鸡蛋 |
| dairy | 유제품 | Dairy | 乳製品 | 乳制品 |
| shellfish | 갑각류 | Shellfish | 甲殻類 | 贝类 |

**번역 테이블 — dietary**

| 키 | 한국어 | English | 日本語 | 中文 |
|----|--------|---------|--------|------|
| spicy | 매운맛 | Spicy | 辛口 | 辣 |
| notSpicy | 안매운맛 | Not Spicy | 辛くない | 不辣 |
| noPork | 돼지고기 없음 | No Pork | 豚肉なし | 无猪肉 |
| vegan | 채식 | Vegan | ビーガン | 素食 |

---

### 2.4 관리자 대시보드 — 날짜 KST 기준 수정 (ADMIN-DATE-01)

| 항목 | 내용 |
|------|------|
| 기능 ID | ADMIN-DATE-01 |
| 우선순위 | 높음 |
| 대상 화면 | 관리자 대시보드 (`Dashboard`) |

**문제**  
백엔드 서버(Render.com)가 UTC 기준으로 운영되므로, `getTodayOrders()` API가 UTC 자정을 기준으로 "오늘" 주문을 반환한다. KST(UTC+9)와 최대 9시간 차이 발생으로 "오늘 주문" 수치 및 최근 활동 날짜가 실제와 불일치.

**변경 전**  
`getTodayOrders()` API 호출 결과를 그대로 "오늘 주문" 카운트로 사용.

**변경 후**  
`getOrders()`로 전체 주문을 조회 후 `isTodayKST()` 함수로 KST 기준 오늘 날짜를 필터링.  
전체 주문을 `createdAt` 내림차순 정렬 후 최근 5개를 최근 활동으로 표시.

**수용 기준**
- `isTodayKST(isoString)` 함수는 ISO 문자열을 `Asia/Seoul` 타임존으로 변환하여 오늘 날짜 여부를 반환한다.
- 오늘 주문 카운트가 KST 자정 기준으로 정확히 집계된다.
- 최근 활동 목록이 `createdAt` 내림차순으로 표시된다.
- `getTodayOrders()` import는 제거하여 불필요한 API 호출을 없앤다.

---

## 3. 변경 파일 목록

| 파일 | 변경 기능 ID |
|------|-------------|
| `ui/src/components/MenuDetail.jsx` | DETAIL-NAV-01, DETAIL-CART-01, DETAIL-DIET-01 |
| `ui/src/App.jsx` | DETAIL-CART-01 |
| `ui/src/i18n.js` | DETAIL-NAV-01, DETAIL-DIET-01 |
| `ui/src/App.css` | DETAIL-NAV-01 (`back-to-list-btn` 스타일) |
| `ui/src/admin/Dashboard.jsx` | ADMIN-DATE-01 |

---

## 4. 비기능 요구사항

- **하위 호환성**: 메뉴 데이터(`menuData.js`) 및 백엔드 API 스키마 변경 없음.
- **성능**: `getOrders()` 단일 호출로 API 요청 횟수 감소 (기존 `getTodayOrders` + `getOrders` 2회 → 1회).
- **접근성**: `back-to-list-btn`에 `aria-label` 속성 유지.
