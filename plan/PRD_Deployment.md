# PRD: Nirvana DX — 배포 (Render.com)

> **Product**: Myeongdong Kimbap 전체 서비스 배포  
> **버전**: v1.0  
> **작성일**: 2026-06-02  
> **플랫폼**: Render.com (PostgreSQL · Web Service · Static Site)  
> **연관 문서**:  
> - [PRD_Backend_Server.md](./PRD_Backend_Server.md) — Spring Boot 백엔드  
> - [PRD_Frontend_UI.md](./PRD_Frontend_UI.md) — 고객용 메뉴 UI  
> - [PRD_Admin_UI.md](./PRD_Admin_UI.md) — 관리자 UI

---

## 1. 개요 (Overview)

### 1.1 배경
로컬 개발 환경에서 완성된 프런트엔드(React + Vite), 백엔드(Spring Boot), 데이터베이스(PostgreSQL)를  
외부 접속 가능한 인터넷 환경에 배포하여 실제 매장 운영에 사용할 수 있도록 한다.

### 1.2 목표
- 프런트엔드, 백엔드, DB를 각각 독립된 서비스로 Render.com에 배포
- 환경변수로 민감 정보(DB 접속 정보 등)를 코드에서 분리
- `localhost` 하드코딩 없이 환경별 API 주소 자동 전환
- 무료 플랜(Free Tier)으로 서비스 운영 가능 구조 유지

### 1.3 범위 외 (Out of Scope)
- 커스텀 도메인 연결 (별도 설정 필요)
- CI/CD 파이프라인 고도화 (GitHub Actions 등)
- HTTPS 인증서 수동 발급 (Render 자동 제공)
- 모니터링 / 알림 설정

---

## 2. 배포 아키텍처

```
[고객 / 관리자]
      │  QR 스캔 / 브라우저 접속
      ▼
┌─────────────────────┐
│  Render Static Site  │  (React + Vite 빌드 결과물)
│  kimbap-ui           │  https://kimbap-ui.onrender.com
└─────────┬───────────┘
          │ HTTPS REST API 요청
          ▼
┌─────────────────────┐
│  Render Web Service  │  (Spring Boot JAR)
│  kimbap-server       │  https://kimbap-server.onrender.com
└─────────┬───────────┘
          │ JDBC (Internal Network)
          ▼
┌─────────────────────┐
│  Render PostgreSQL   │  (관리형 PostgreSQL)
│  kimbap-db           │  Internal Database URL
└─────────────────────┘
```

> **내부 통신**: 백엔드 ↔ DB는 Render 내부 네트워크(Internal URL)를 사용해 외부 노출 없이 통신

---

## 3. 기술 스택 (Tech Stack)

| 구분 | 항목 | 비고 |
|---|---|---|
| 호스팅 | Render.com | Free Tier |
| 프론트엔드 | Static Site | Vite 빌드 → `dist/` 서빙 |
| 백엔드 | Web Service (Docker) | Dockerfile로 JAR 빌드 및 실행 |
| 데이터베이스 | Render PostgreSQL | 관리형 PostgreSQL |
| 환경변수 관리 | Render Environment Variables | 민감 정보 코드 분리 |

---

## 4. 사전 준비 (Prerequisites)

### 4.1 코드 변경 사항 (배포 전 적용 완료)

#### 백엔드 — `server/src/main/resources/application.properties`

로컬 하드코딩 값을 환경변수 + 기본값 형태로 변경:

```properties
server.port=${PORT:8080}
spring.datasource.url=${DATABASE_URL:jdbc:postgresql://localhost:5432/kimbapdb}
spring.datasource.username=${DB_USERNAME:postgres}
spring.datasource.password=${DB_PASSWORD:12345}
spring.jpa.hibernate.ddl-auto=update
```

- `ddl-auto=create` → `update` 변경: 재배포 시 기존 데이터 보존
- `${ENV_KEY:default}` 패턴: 환경변수가 없으면 로컬 기본값 사용

#### 프론트엔드 — `ui/src/store/orderStore.js`

```js
// 변경 전
const API_BASE = 'http://localhost:8080'

// 변경 후
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080'
```

- Vite 빌드 시 `VITE_` 접두사 환경변수를 번들에 주입
- 로컬: `ui/.env` 파일의 `VITE_API_BASE=http://localhost:8080` 사용
- 배포: Render 환경변수 `VITE_API_BASE=https://kimbap-server.onrender.com` 사용

#### 프론트엔드 — `ui/.gitignore`

```
.env
.env.local
```

> `.env` 파일이 Git에 커밋되지 않도록 추가

### 4.2 Git 레포지토리

- GitHub에 코드가 Push된 상태여야 함
- 모노레포 구조 (`server/`, `ui/` 폴더 분리) 그대로 사용

---

## 5. 배포 순서 (Deployment Steps)

### STEP 1 — PostgreSQL 데이터베이스 생성

| 항목 | 값 |
|---|---|
| 서비스 타입 | PostgreSQL |
| Name | `kimbap-db` |
| Region | Singapore |
| Plan | Free |

**생성 후 수집 정보:**
- Internal Database URL → STEP 2 환경변수에 사용
- Username / Password → STEP 2 환경변수에 사용

> Internal URL 형식: `postgresql://user:password@hostname/dbname`

---

### STEP 2 — Spring Boot 백엔드 배포

> Render.com은 Java 런타임을 직접 지원하지 않으므로 **Docker**로 배포한다.  
> `server/Dockerfile`이 빌드 및 실행을 모두 담당한다.

| 항목 | 값 |
|---|---|
| 서비스 타입 | Web Service |
| Name | `kimbap-server` |
| Root Directory | `server` |
| Language | **Docker** |
| Dockerfile Path | `./Dockerfile` (자동 감지) |
| Plan | Free |

**환경변수 설정:**

| Key | Value | 출처 |
|---|---|---|
| `DATABASE_URL` | `jdbc:postgresql://<host>/<dbname>` | STEP 1 Internal URL 변환 |
| `DB_USERNAME` | `<username>` | STEP 1 생성 정보 |
| `DB_PASSWORD` | `<password>` | STEP 1 생성 정보 |

> Render PostgreSQL의 Internal Database URL은 `postgresql://` 스킴으로 제공됨.  
> Spring Boot는 `jdbc:postgresql://` 스킴이 필요하므로 `postgresql://` → `jdbc:postgresql://` 로 앞부분만 교체

**배포 완료 후 수집 정보:**
- 서비스 URL (예: `https://kimbap-server.onrender.com`) → STEP 3 환경변수에 사용

---

### STEP 3 — React 프론트엔드 배포

| 항목 | 값 |
|---|---|
| 서비스 타입 | Static Site |
| Name | `kimbap-ui` |
| Root Directory | `ui` |
| Build Command | `npm install && npm run build` |
| Publish Directory | `dist` |
| Plan | Free |

**환경변수 설정:**

| Key | Value | 출처 |
|---|---|---|
| `VITE_API_BASE` | `https://kimbap-server.onrender.com` | STEP 2 서비스 URL |

> Static Site 빌드 시 Render가 환경변수를 주입하여 `import.meta.env.VITE_API_BASE` 값이 백엔드 URL로 번들링됨

---

## 6. 환경변수 목록 (Environment Variables)

### 백엔드 (kimbap-server)

| 변수명 | 설명 | 예시 |
|---|---|---|
| `DATABASE_URL` | PostgreSQL JDBC 접속 URL | `jdbc:postgresql://host/kimbapdb` |
| `DB_USERNAME` | DB 사용자명 | `kimbap_user` |
| `DB_PASSWORD` | DB 비밀번호 | `****` |
| `PORT` | 서버 포트 (Render 자동 주입) | `10000` |

### 프론트엔드 (kimbap-ui)

| 변수명 | 설명 | 예시 |
|---|---|---|
| `VITE_API_BASE` | 백엔드 API 베이스 URL | `https://kimbap-server.onrender.com` |

---

## 7. 로컬 개발 환경 (Local Development)

코드 변경 후에도 로컬 개발은 기존과 동일하게 동작:

| 항목 | 로컬 | 배포 |
|---|---|---|
| 백엔드 포트 | `8080` (기본값) | Render 자동 할당 (`PORT` 환경변수) |
| DB URL | `localhost:5432/kimbapdb` (기본값) | Render Internal DB URL |
| 프론트 API URL | `ui/.env`의 `VITE_API_BASE` | Render 환경변수 `VITE_API_BASE` |

---

## 8. 주의사항 및 제약

| 항목 | 내용 |
|---|---|
| Free Tier 슬립 | Web Service는 15분 비활성 시 슬립 → 첫 요청 응답에 30~60초 소요 |
| `ddl-auto=update` | 재배포 시 테이블 구조 변경만 반영, 기존 데이터 유지 |
| `data.sql` 중복 삽입 | `update` 모드에서 `data.sql`이 매 기동 시 실행되면 데이터 중복 가능 → 운영 전 확인 필요 |
| CORS | `WebConfig.java`에서 허용 Origin에 배포된 프론트엔드 URL 추가 필요 |
| `.env` 파일 | `.gitignore`에 포함되어 Git에 커밋되지 않음 → Render 환경변수로만 관리 |
| Internal URL | DB ↔ 백엔드는 Render 내부 네트워크만 사용 가능 (External URL은 유료 플랜) |

---

## 9. 배포 후 검증 (Verification Checklist)

- [ ] `https://kimbap-server.onrender.com/api/menus` 응답 200 OK
- [ ] `https://kimbap-server.onrender.com/api/orders` 응답 200 OK
- [ ] 프론트엔드에서 메뉴 목록 정상 로드
- [ ] 주문 생성 후 관리자 UI에서 주문 확인
- [ ] 브라우저 콘솔에 CORS 에러 없음
