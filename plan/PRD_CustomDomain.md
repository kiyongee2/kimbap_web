# PRD: 커스텀 도메인 전환 — kimbap-ui.onrender.com → menu.nirvanasoft.kr/s/0001/qr01

> **Product**: Myeongdong Kimbap 고객용 메뉴 앱  
> **버전**: v1.1  
> **작성일**: 2026-06-04  
> **플랫폼**: Render.com Static Site + 커스텀 도메인(DNS)  
> **연관 문서**: [PRD_Deployment.md](./PRD_Deployment.md), [PRD_Frontend_UI.md](./PRD_Frontend_UI.md)

---

## 1. 개요 (Overview)

### 1.1 배경
현재 고객용 메뉴 앱은 Render.com이 자동 부여한 `https://kimbap-ui.onrender.com` 주소로 서비스된다.  
QR 코드 인쇄물 및 매장 안내 자재에 브랜드 도메인을 사용하기 위해  
`menu.nirvanasoft.kr/s/0001/qr01` 경로로 변경이 필요하다.

### 1.2 목표
- 고객이 `menu.nirvanasoft.kr/s/0001/qr01` 접속 시 동일한 메뉴 앱이 실행되도록 한다
- HTTPS 보안 연결을 유지한다
- QR 코드 재인쇄 최소화를 위해 경로(`/s/0001/qr01`)를 고정한다
- 기존 `kimbap-ui.onrender.com` 주소로 접속해도 동작이 깨지지 않는다

### 1.3 대상 사용자
| 사용자 유형 | 설명 |
|---|---|
| 매장 고객 | QR 코드 스캔 후 메뉴 앱 접속 |
| 매장 관리자 | QR 코드 인쇄물 교체 최소화 |

### 1.4 범위 외 (Out of Scope)
- 백엔드 API 도메인 변경 (`kimbap-server.onrender.com` 유지)
- 관리자 페이지 도메인 변경
- 멀티 테넌트(다점포) QR 경로 관리 자동화

---

## 2. 용어 정의

| 용어 | 설명 |
|---|---|
| **커스텀 도메인** | Render 기본 도메인 대신 사용하는 사용자 소유 도메인 (`menu.nirvanasoft.kr`) |
| **서브도메인** | `nirvanasoft.kr`의 하위 도메인 (`menu`) |
| **Base Path** | 앱이 서빙되는 URL 경로 접두사 (`/s/0001/qr01`) |
| **CNAME 레코드** | 도메인을 다른 도메인으로 연결하는 DNS 레코드 |
| **방식 A (Redirect)** | `/s/0001/qr01` → `/` 로 302 리다이렉트 후 앱 실행 |
| **방식 B (Base Path)** | `/s/0001/qr01/`을 앱의 루트 경로로 사용 |

---

## 3. 기능 요구사항

### 3.1 커스텀 도메인 등록 (DNS)

| 항목 | 내용 |
|---|---|
| **기능 ID** | DOM-DNS-01 |
| **우선순위** | High |
| **담당** | 운영자 (Render 대시보드 + DNS 관리 업체) |

**작업 절차**
1. Render Dashboard → `kimbap-ui` Static Site → **Settings → Custom Domains**
2. `menu.nirvanasoft.kr` 입력 → Render 안내 값 확인
3. 도메인 관리 업체 DNS 콘솔에서 아래 레코드 추가:

```
Type  : CNAME
Name  : menu
Value : kimbap-ui.onrender.com
TTL   : 300 (또는 Auto)
```

**수용 기준 (Acceptance Criteria)**
- [ ] `https://menu.nirvanasoft.kr` 접속 시 앱이 정상 로드된다
- [ ] HTTPS 인증서가 자동 발급되어 브라우저 경고가 없다
- [ ] DNS 전파 후 전 세계 주요 지역에서 접속 가능하다

---

### 3.2 경로 처리 — 방식 A: Redirect (권장)

| 항목 | 내용 |
|---|---|
| **기능 ID** | DOM-PATH-01 |
| **우선순위** | High |
| **적합 상황** | 경로 유지 없이 앱 실행만 필요한 경우 (QR 랜딩 전용) |
| **변경 파일** | `ui/public/_redirects` |

**변경 내용**

```
# 기존
/* /index.html 200

# 추가 (맨 위에 삽입)
/s/0001/qr01  /  302
```

> `/s/0001/qr01` 접속 → 루트(`/`)로 302 리다이렉트 → 앱 실행

**수용 기준 (Acceptance Criteria)**
- [ ] `menu.nirvanasoft.kr/s/0001/qr01` 접속 시 앱이 정상 로드된다
- [ ] 리다이렉트 후 주소창이 `menu.nirvanasoft.kr/` 로 변경된다
- [ ] 앱의 모든 기능(언어 선택, 메뉴 조회, 주문)이 정상 동작한다

---

### 3.3 경로 처리 — 방식 B: Base Path 고정 (선택)

| 항목 | 내용 |
|---|---|
| **기능 ID** | DOM-PATH-02 |
| **우선순위** | Medium |
| **적합 상황** | 주소창에 `/s/0001/qr01` 경로가 유지되어야 하는 경우 |
| **변경 파일** | `ui/vite.config.js`, `ui/public/_redirects` |

**변경 내용 — vite.config.js**

```js
export default defineConfig({
  plugins: [react()],
  base: '/s/0001/qr01/',
})
```

**변경 내용 — _redirects**

```
/s/0001/qr01/*  /s/0001/qr01/index.html  200
```

**수용 기준 (Acceptance Criteria)**
- [ ] `menu.nirvanasoft.kr/s/0001/qr01` 접속 시 앱이 정상 로드된다
- [ ] 주소창에 `/s/0001/qr01` 경로가 유지된다
- [ ] 빌드 산출물의 모든 asset 경로가 `/s/0001/qr01/assets/...` 로 생성된다
- [ ] 앱의 모든 기능이 정상 동작한다

---

## 4. 비기능 요구사항

| 항목 | 요구사항 |
|---|---|
| **보안** | HTTPS 강제 적용 (Render 자동 Let's Encrypt 인증서) |
| **가용성** | 기존 `kimbap-ui.onrender.com` 주소로도 접속 가능 유지 |
| **성능** | 리다이렉트로 인한 추가 지연 ≤ 200ms (방식 A) |
| **호환성** | iOS Safari, Android Chrome, 삼성 인터넷 브라우저 정상 동작 |

---

## 5. 작업 순서 요약

```
1. [운영자] Render 대시보드 → Custom Domain 등록
2. [운영자] DNS CNAME 레코드 추가 (menu → kimbap-ui.onrender.com)
3. [개발자] _redirects 파일 수정 (방식 A 또는 B 선택)
4. [개발자] (방식 B 선택 시) vite.config.js base 경로 수정
5. [개발자] git commit & push → Render 자동 재배포
6. [운영자] DNS 전파 확인 (수 분 ~ 48시간)
7. [QA] menu.nirvanasoft.kr/s/0001/qr01 접속 테스트
8. [운영자] QR 코드 인쇄물 교체
```

---

## 6. 변경 파일 목록

| 파일 | 변경 내용 | 방식 |
|---|---|---|
| `ui/public/_redirects` | `/s/0001/qr01` redirect 규칙 추가 | A, B 공통 |
| `ui/vite.config.js` | `base: '/s/0001/qr01/'` 추가 | B만 해당 |
| Render 대시보드 | Custom Domain 등록 | 공통 |
| DNS 관리 콘솔 | CNAME 레코드 추가 | 공통 |

---

## 7. 변경 이력

| 버전 | 날짜 | 작성자 | 내용 |
|---|---|---|---|
| v1.0 | 2026-06-04 | — | 최초 작성 |
