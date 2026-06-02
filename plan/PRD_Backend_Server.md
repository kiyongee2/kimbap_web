# PRD: Nirvana DX — 백엔드 서버 (Spring Boot)

> **Product**: Myeongdong Kimbap 백엔드 API 서버  
> **버전**: v1.0  
> **작성일**: 2026-06-01  
> **플랫폼**: Spring Boot 3.5.14 / Java 21  
> **연관 문서**:  
> - [PRD_Frontend_UI.md](./PRD_Frontend_UI.md) — 고객용 메뉴 UI  
> - [PRD_Admin_UI.md](./PRD_Admin_UI.md) — 관리자 UI  
> - [PRD_Order_Sync.md](./PRD_Order_Sync.md) — 주문 동기화

---

## 1. 개요 (Overview)

### 1.1 배경
기존 프런트엔드(React + Vite)는 `localStorage`를 통해 고객 앱과 관리자 앱 간 주문을 동기화하였다.  
단일 기기 내 탭 간 공유는 가능하지만 **다중 기기 간 실시간 공유**, **데이터 영속성**, **관리자 API** 제공이 불가능하다는 한계가 있어 별도의 백엔드 서버를 구축한다.

### 1.2 목표
- 메뉴 및 주문 데이터를 REST API로 제공
- 프런트엔드(고객 앱 · 관리자 앱)와 CORS 없이 안전하게 통신
- PostgreSQL DB로 개발 및 운영 환경 통일
- WebSocket을 통한 실시간 주문 동기화 기반 마련 (v1.1 예정)

### 1.3 범위 외 (Out of Scope)
- 결제 처리 및 POS 연동
- 사용자 인증 / JWT (v1.1 예정)
- 프로덕션 DB 마이그레이션 (v1.1 예정)
- 다중 지점 관리

---

## 2. 기술 스택 (Tech Stack)

| 항목 | 선택 | 이유 |
|---|---|---|
| 프레임워크 | Spring Boot 3.5.14 | 최신 LTS, Spring 6 기반 |
| 언어 | Java 21 | 최신 LTS (Virtual Threads, Record Patterns 지원) |
| 빌드 도구 | Maven 3.9.11 + Maven Wrapper | 의존성 버전 고정 및 팀 일관성 |
| ORM | Spring Data JPA (Hibernate 6) | 엔티티-테이블 자동 매핑 |
| DB | PostgreSQL | 영속성 및 다중 접속, 개발·운영 환경 동일 DB 사용 |
| 유틸 | Lombok | 보일러플레이트 코드 제거 |
| 실시간 | Spring WebSocket (기반만 구성) | 주문 Push 알림 |
| 개발 편의 | Spring Boot DevTools | 코드 변경 자동 재시작 |

---

## 3. 프로젝트 구조 (Project Structure)

```
server/
├── pom.xml                              # 의존성 관리
├── mvnw / mvnw.cmd                      # Maven Wrapper
├── .gitignore
└── src/
    ├── main/
    │   ├── java/com/kimbap/server/
    │   │   ├── KimbapServerApplication.java     # @SpringBootApplication 진입점
    │   │   ├── config/
    │   │   │   └── WebConfig.java               # CORS 설정
    │   │   ├── controller/
    │   │   │   ├── MenuController.java           # /api/menus REST 엔드포인트
    │   │   │   └── OrderController.java          # /api/orders REST 엔드포인트
    │   │   ├── domain/
    │   │   │   ├── Menu.java                     # 메뉴 엔티티
    │   │   │   ├── Order.java                    # 주문 엔티티
    │   │   │   ├── OrderItem.java                # 주문 항목 엔티티
    │   │   │   └── OrderStatus.java              # 주문 상태 Enum
    │   │   ├── repository/
    │   │   │   ├── MenuRepository.java           # JPA 메뉴 레포지토리
    │   │   │   └── OrderRepository.java          # JPA 주문 레포지토리
    │   │   └── service/
    │   │       ├── MenuService.java              # 메뉴 비즈니스 로직
    │   │       └── OrderService.java             # 주문 비즈니스 로직
    │   └── resources/
    │       └── application.properties           # DB, JPA, 로깅 설정
    └── test/
        └── java/com/kimbap/server/
            └── KimbapServerApplicationTests.java # 컨텍스트 로드 테스트
```

---

## 4. 도메인 모델 (Domain Model)

### 4.1 엔티티 관계도

```
Menu (menus)
 ├── id            BIGINT PK
 ├── nameKo        VARCHAR NOT NULL
 ├── nameEn        VARCHAR
 ├── nameJa        VARCHAR
 ├── nameZh        VARCHAR
 ├── price         INT NOT NULL
 ├── category      VARCHAR
 ├── imageUrl      VARCHAR
 ├── descriptionKo TEXT
 ├── descriptionEn VARCHAR
 ├── descriptionJa VARCHAR
 ├── descriptionZh VARCHAR
 └── available     BOOLEAN DEFAULT TRUE

Order (orders)
 ├── id            BIGINT PK
 ├── orderNumber   VARCHAR NOT NULL UNIQUE   ← "ORD-XXXXXXXX" 자동 생성
 ├── totalAmount   INT NOT NULL
 ├── status        ENUM(PENDING|ACCEPTED|PREPARING|READY|CANCELLED)
 ├── language      VARCHAR(5)                ← ko / en / ja / zh
 ├── createdAt     DATETIME NOT NULL
 └── items[]       → OrderItem (1:N)

OrderItem (order_items)
 ├── id            BIGINT PK
 ├── order_id      FK → Order
 ├── menu_id       FK → Menu (nullable: 메뉴 삭제 후 이력 보존)
 ├── menuName      VARCHAR NOT NULL          ← 주문 당시 메뉴명 스냅샷
 ├── quantity      INT NOT NULL
 └── unitPrice     INT NOT NULL
```

### 4.2 주문 상태 흐름

```
PENDING → ACCEPTED → PREPARING → READY
    └──────────────────────────→ CANCELLED
```

| 상태 | 설명 |
|---|---|
| `PENDING` | 고객 주문 확정 직후, 관리자 미확인 |
| `ACCEPTED` | 관리자 주문 접수 |
| `PREPARING` | 조리 중 |
| `READY` | 완료 (픽업 대기) |
| `CANCELLED` | 취소 |

---

## 5. API 명세 (REST API)

### 5.1 메뉴 API (`/api/menus`)

| Method | Path | 설명 | Query Params |
|---|---|---|---|
| `GET` | `/api/menus` | 전체 메뉴 조회 | `category`, `available=true` |
| `GET` | `/api/menus/{id}` | 단일 메뉴 조회 | — |
| `POST` | `/api/menus` | 메뉴 등록 | Body: Menu JSON |
| `PUT` | `/api/menus/{id}` | 메뉴 전체 수정 | Body: Menu JSON |
| `DELETE` | `/api/menus/{id}` | 메뉴 삭제 | — |

**GET /api/menus 응답 예시:**
```json
[
  {
    "id": 1,
    "nameKo": "참치김밥",
    "nameEn": "Tuna Kimbap",
    "nameJa": "ツナキンパ",
    "nameZh": "金枪鱼紫菜包饭",
    "price": 4500,
    "category": "김밥",
    "available": true
  }
]
```

### 5.2 주문 API (`/api/orders`)

| Method | Path | 설명 | Query Params / Body |
|---|---|---|---|
| `GET` | `/api/orders` | 전체 주문 조회 | `status`, `today=true` |
| `GET` | `/api/orders/count/today` | 오늘 주문 건수 | — |
| `GET` | `/api/orders/{id}` | 단일 주문 조회 | — |
| `POST` | `/api/orders` | 주문 생성 | Body: Order JSON |
| `PATCH` | `/api/orders/{id}/status` | 주문 상태 변경 | Body: `{ "status": "ACCEPTED" }` |

**POST /api/orders 요청 예시:**
```json
{
  "totalAmount": 13500,
  "language": "ko",
  "items": [
    { "menuName": "참치김밥", "quantity": 2, "unitPrice": 4500 },
    { "menuName": "라볶이", "quantity": 1, "unitPrice": 4500 }
  ]
}
```

**POST /api/orders 응답 예시:**
```json
{
  "id": 1,
  "orderNumber": "ORD-A1B2C3D4",
  "totalAmount": 13500,
  "status": "PENDING",
  "language": "ko",
  "createdAt": "2026-06-01T12:30:00",
  "items": [...]
}
```

---

## 6. 설정 (Configuration)

### 6.1 application.properties (개발 환경)

```properties
server.port=8080

# PostgreSQL
spring.datasource.url=jdbc:postgresql://localhost:5432/kimbapdb
spring.datasource.driver-class-name=org.postgresql.Driver
spring.datasource.username=postgres
spring.datasource.password=

# JPA
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.hibernate.ddl-auto=create
spring.jpa.show-sql=true
```

> JDBC URL: `jdbc:postgresql://localhost:5432/kimbapdb`  
> Username: `postgres` / Password: (환경에 맞게 설정)

### 6.2 CORS 설정 (WebConfig.java)

| 허용 Origin | 용도 |
|---|---|
| `http://localhost:5173` | Vite 개발 서버 |
| `http://localhost:4173` | Vite 프리뷰 |

허용 메서드: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `OPTIONS`

---

## 7. 서버 실행 방법

```bash
# server/ 디렉터리로 이동
cd server

# 개발 서버 실행 (DevTools 핫 리로드 포함)
./mvnw spring-boot:run

# 또는 Maven이 전역 설치된 경우
mvn spring-boot:run

# 빌드 검증
mvn compile

# 테스트 실행
mvn test

# 실행 가능한 JAR 패키징
mvn package
java -jar target/kimbap-server-0.0.1-SNAPSHOT.jar
```

---

## 8. 개발 로드맵 (Roadmap)

| 버전 | 기능 | 상태 |
|---|---|---|
| **v1.0** | 프로젝트 구조 · 도메인 모델 · REST API · PostgreSQL DB | ✅ 완료 |
| **v1.0.1** | Java 17 → 21 (LTS) · Spring Boot 3.2.5 → 3.5.14 · Maven Wrapper 3.9.11 | ✅ 완료 |
| **v1.1** | JWT 인증 · Spring Security | 예정 |
| **v1.1** | WebSocket 실시간 주문 Push | 예정 |
| **v1.2** | Flyway 마이그레이션 스크립트 관리 | 예정 |
| **v1.2** | 운영 환경 Docker 컨테이너화 | 예정 |
| **v1.3** | 통계 집계 API (일별·주별·메뉴별) | 예정 |

---

## 9. 의존성 목록 (Dependencies)

| 라이브러리 | 버전 | 용도 |
|---|---|---|
| `spring-boot-starter-parent` | 3.5.14 | 전체 의존성 BOM |
| `spring-boot-starter-web` | — | REST API (Tomcat 내장) |
| `spring-boot-starter-data-jpa` | — | JPA/Hibernate ORM |
| `spring-boot-starter-validation` | — | Bean Validation |
| `spring-boot-starter-websocket` | — | WebSocket 지원 |
| `postgresql` | — | PostgreSQL JDBC 드라이버 (runtime) |
| `lombok` | — | 코드 생성 (optional) |
| `spring-boot-devtools` | — | 개발 편의 (runtime/optional) |
| `spring-boot-starter-test` | — | JUnit 5 테스트 (test) |
