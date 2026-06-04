# PRD: Render.com Shell — PostgreSQL 확인 가이드

> **Product**: Myeongdong Kimbap 전체 서비스 운영  
> **버전**: v1.0  
> **작성일**: 2026-06-02  
> **플랫폼**: Render.com (PostgreSQL · Web Service Shell)  
> **연관 문서**:  
> - [PRD_Deployment.md](./PRD_Deployment.md) — 전체 배포 절차  
> - [PRD_Backend_Server.md](./PRD_Backend_Server.md) — Spring Boot 백엔드  
> - [PRD_Troubleshooting.md](./PRD_Troubleshooting.md) — 트러블슈팅

---

## 1. 개요 (Overview)

### 1.1 배경
Render.com에 배포된 Spring Boot 애플리케이션이 PostgreSQL에 정상 연결되어 있는지,  
테이블과 데이터가 올바르게 생성되었는지 확인할 수 있는 절차가 필요하다.

### 1.2 목표
- Render Shell 및 PostgreSQL 대시보드에서 DB 상태를 직접 확인
- 운영 중 데이터 조회·검증에 필요한 명령어 제공
- 배포 후 Checklist 형태로 빠른 검증 가능

### 1.3 범위 외 (Out of Scope)
- 데이터 마이그레이션 / 스키마 변경 작업
- 백업 및 복원 절차
- DB 성능 튜닝

---

## 2. 접근 방법 선택

Render.com에서 PostgreSQL을 확인하는 방법은 두 가지다.

| 방법 | 위치 | 특징 |
|------|------|------|
| **A. PostgreSQL 서비스 Shell** | Render Dashboard → PostgreSQL 서비스 → Shell | `psql` 직접 사용 가능, 권장 |
| **B. Web Service Shell** | Render Dashboard → Web Service → Shell | `psql` 미설치 시 환경변수 확인만 가능 |

> **권장**: PostgreSQL 서비스의 Shell 탭을 사용한다.  
> Web Service Shell에는 `psql` 클라이언트가 설치되지 않아 직접 DB 접속이 불가할 수 있다.

---

## 3. 방법 A — PostgreSQL 서비스 Shell 사용

### 3.1 접속 경로

```
Render Dashboard
  └─ kimbap-db (PostgreSQL 서비스 클릭)
       └─ Shell 탭
```

Shell 탭에 접속하면 `psql` 세션이 자동으로 시작된다.

### 3.2 DB 기본 정보 확인

```sql
-- 현재 연결 정보 확인
\conninfo

-- 데이터베이스 목록
\l

-- 현재 DB의 스키마 목록
\dn
```

### 3.3 테이블 확인

```sql
-- 테이블 목록
\dt

-- menus 테이블 구조
\d menus

-- orders 테이블 구조
\d orders

-- order_items 테이블 구조
\d order_items
```

### 3.4 데이터 조회

```sql
-- 메뉴 전체 조회
SELECT * FROM menus;

-- 주문 전체 조회 (최신순)
SELECT * FROM orders ORDER BY created_at DESC;

-- 주문 항목 전체 조회
SELECT * FROM order_items;

-- 주문 + 주문 항목 JOIN 조회
SELECT o.id, o.status, o.created_at, oi.menu_id, oi.quantity
FROM orders o
JOIN order_items oi ON o.id = oi.order_id
ORDER BY o.created_at DESC;

-- 메뉴 개수 확인
SELECT COUNT(*) FROM menus;

-- 주문 상태별 집계
SELECT status, COUNT(*) FROM orders GROUP BY status;
```

### 3.5 psql 종료

```sql
\q
```

---

## 4. 방법 B — Web Service Shell 사용

### 4.1 접속 경로

```
Render Dashboard
  └─ kimbap-server (Web Service 클릭)
       └─ Shell 탭
```

### 4.2 환경변수 확인

```bash
# DATABASE_URL 환경변수 확인
echo $DATABASE_URL

# 모든 환경변수 목록
env | grep -E "DATABASE|DB_|PORT"
```

### 4.3 psql 설치 여부 확인

```bash
which psql
psql --version
```

### 4.4 psql이 있는 경우 DB 직접 접속

```bash
# DATABASE_URL은 jdbc:postgresql:// 스킴이므로
# psql은 postgresql:// 스킴 필요 → 환경변수 가공
DB_URL=$(echo $DATABASE_URL | sed 's/jdbc://')
psql "$DB_URL"
```

> Web Service 컨테이너에는 일반적으로 `psql`이 없으므로,  
> DB 직접 조회가 필요하면 **방법 A (PostgreSQL 서비스 Shell)**를 사용한다.

---

## 5. 방법 C — 로컬 터미널에서 External URL로 접속

> Render PostgreSQL **External Database URL**은 유료 플랜에서만 제공된다.  
> Free Tier에서는 External URL 접속이 불가하다.

| 플랜 | External URL | 비고 |
|------|-------------|------|
| Free | 불가 | Internal URL만 제공 |
| Paid (Starter 이상) | 가능 | 로컬 `psql` 또는 DBeaver로 접속 가능 |

---

## 6. Spring Boot 로그에서 DB 연결 확인

Render Dashboard → **kimbap-server** → **Logs** 탭에서 아래 키워드로 필터링:

| 확인 항목 | 로그 키워드 |
|----------|------------|
| HikariCP 연결 풀 초기화 성공 | `HikariPool-1 - Start completed` |
| Hibernate 테이블 생성/업데이트 | `create table`, `alter table` |
| Datasource 설정 로드 | `datasource` |
| DB 연결 실패 | `Connection refused`, `Unable to acquire JDBC Connection` |

```
# 로그 예시 — 정상 연결
HikariPool-1 - Starting...
HikariPool-1 - Start completed.
Hibernate: create table if not exists menus (...)
Hibernate: create table if not exists orders (...)
```

---

## 7. 주요 확인 명령어 요약

| 목적 | 명령어 |
|------|--------|
| 연결 정보 확인 | `\conninfo` |
| 테이블 목록 | `\dt` |
| 테이블 구조 | `\d 테이블명` |
| 데이터베이스 목록 | `\l` |
| 메뉴 전체 조회 | `SELECT * FROM menus;` |
| 주문 전체 조회 | `SELECT * FROM orders ORDER BY created_at DESC;` |
| 주문 항목 조회 | `SELECT * FROM order_items;` |
| 메뉴 개수 | `SELECT COUNT(*) FROM menus;` |
| 주문 상태 집계 | `SELECT status, COUNT(*) FROM orders GROUP BY status;` |
| psql 종료 | `\q` |

---

## 8. 배포 후 PostgreSQL 검증 Checklist

- [ ] Render PostgreSQL 서비스 상태가 `Available` 인지 확인
- [ ] Shell에서 `\conninfo`로 연결 정보 확인
- [ ] `\dt`로 `menus`, `orders`, `order_items` 테이블 존재 확인
- [ ] `SELECT COUNT(*) FROM menus;` 결과가 0 이상인지 확인 (`data.sql` 정상 실행 여부)
- [ ] kimbap-server Logs에서 `HikariPool-1 - Start completed` 확인
- [ ] `https://kimbap-server.onrender.com/api/menus` 응답 200 OK 확인

---

## 9. 트러블슈팅

| 증상 | 원인 | 해결 방법 |
|------|------|----------|
| `psql: command not found` | Web Service 컨테이너에 psql 미설치 | PostgreSQL 서비스 Shell 탭 사용 |
| `Connection refused` 로그 | `DATABASE_URL` 환경변수 오류 | Render 환경변수에서 `jdbc:postgresql://` 스킴 확인 |
| 테이블이 없음 (`\dt` 결과 없음) | `ddl-auto` 미적용 또는 DB 연결 실패 후 앱 기동 | kimbap-server 재시작 후 로그 확인 |
| `data.sql` 데이터 중복 삽입 | 재기동 시마다 `data.sql` 실행 | `INSERT INTO ... ON CONFLICT DO NOTHING` 패턴 사용 |
| External URL 접속 불가 | Free Tier 제한 | PostgreSQL 서비스 Shell 또는 유료 플랜 사용 |
