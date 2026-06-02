# PRD: Nirvana DX — 배포 운영 트러블슈팅

> **Product**: Myeongdong Kimbap 배포 운영 오류 해결 기록  
> **버전**: v1.0  
> **작성일**: 2026-06-02  
> **플랫폼**: Render.com  
> **연관 문서**: [PRD_Deployment.md](./PRD_Deployment.md) — 배포 절차

---

## 개요

Render.com 최초 배포 및 운영 중 발생한 오류 3건의 원인과 해결 방법을 기록한다.  
동일한 환경에서 재배포하거나 신규 서비스를 추가할 때 참고한다.

---

## 이슈 #1 — 백엔드 Language 설정 오류

### 증상
Render Web Service 생성 시 **Language 목록에 Java가 없음**

### 원인
Render.com은 Java 런타임을 Native 언어로 지원하지 않는다.  
Node.js, Python, Ruby, Go 등만 직접 지원하며, JVM 기반 앱은 **Docker**로 배포해야 한다.

### 해결

`server/Dockerfile` 신규 생성 (멀티스테이지 빌드):

```dockerfile
# 1단계: 빌드
FROM eclipse-temurin:21-jdk AS builder
WORKDIR /app
COPY pom.xml .
COPY mvnw .
COPY .mvn .mvn
RUN chmod +x mvnw
RUN ./mvnw dependency:go-offline -q
COPY src ./src
RUN ./mvnw clean package -DskipTests -q

# 2단계: 실행
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=builder /app/target/kimbap-server-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

**Render 설정 변경:**

| 항목 | 변경 전 | 변경 후 |
|---|---|---|
| Language | Java (선택 불가) | **Docker** |
| Build Command | `./mvnw clean package -DskipTests` | Dockerfile 자동 처리 |
| Start Command | `java -jar target/...jar` | Dockerfile 자동 처리 |

### 영향 파일
- `server/Dockerfile` (신규)

---

## 이슈 #2 — 백엔드 기동 실패 (DB 연결 오류)

### 증상
```
HikariDataSource (null)
Database driver: undefined/unknown
==> Exited with status 1
```

### 원인
Render PostgreSQL이 제공하는 **Internal Database URL** 형식:
```
postgresql://username:password@host:port/dbname
```

Spring Boot JDBC가 요구하는 형식:
```
jdbc:postgresql://host:port/dbname
```

`application.properties`의 `${DATABASE_URL}` 에 Render URL을 그대로 넣으면  
`jdbc:` 접두사가 없어 JDBC 드라이버가 URL을 인식하지 못한다.

### 해결

`RenderEnvironmentPostProcessor.java` 신규 생성:  
앱 기동 직전에 `DATABASE_URL` 환경변수를 감지하여 자동 변환한다.

```
postgresql://user:pass@host:port/db
        ↓ 자동 변환
jdbc:postgresql://host:port/db
+ spring.datasource.username = user
+ spring.datasource.password = pass
```

`META-INF/spring.factories`에 등록하여 Spring Boot가 자동으로 실행:

```properties
org.springframework.boot.env.EnvironmentPostProcessor=\
  com.kimbap.server.config.RenderEnvironmentPostProcessor
```

**추가 조치:** `application.properties`에서 `spring.jpa.database-platform` 제거  
→ Hibernate 6에서 Dialect를 명시하면 `HHH90000025` 경고 발생 (자동 감지 권장)

**Render 환경변수 설정 (간소화):**

| Key | Value |
|---|---|
| `DATABASE_URL` | Internal Database URL 그대로 붙여넣기 (`postgresql://...`) |

`DB_USERNAME`, `DB_PASSWORD` 별도 설정 불필요 — URL에서 자동 추출

### 영향 파일
- `server/src/main/java/com/kimbap/server/config/RenderEnvironmentPostProcessor.java` (신규)
- `server/src/main/resources/META-INF/spring.factories` (신규)
- `server/src/main/resources/application.properties` (수정)

---

## 이슈 #3 — `/admin` 접속 시 404 Not Found

### 증상
```
https://kimbap-ui.onrender.com/admin 접속 → Not Found
```

### 원인
`kimbap-ui`는 Render **Static Site**로 배포된 SPA(Single Page Application)이다.  
SPA는 모든 라우팅을 클라이언트(JavaScript)가 처리하지만,  
Render는 `/admin` 경로 요청 시 `dist/admin/index.html` 파일을 찾다가 없으면 404를 반환한다.

`main.jsx`의 라우팅 방식:
```js
const isAdmin = window.location.pathname.startsWith('/admin')
// → /admin URL로 직접 접속하면 index.html이 먼저 로드돼야 동작함
```

### 해결

`ui/public/_redirects` 신규 생성:

```
/* /index.html 200
```

모든 경로(`/*`)를 `index.html`로 **Rewrite(200)**하여 React가 URL을 읽고 화면을 결정한다.

**또는** Render 대시보드에서 직접 설정:  
`kimbap-ui` → **Redirects/Rewrites** → Add Rule

| Source | Destination | Action |
|---|---|---|
| `/*` | `/index.html` | Rewrite |

> `_redirects` 파일과 대시보드 규칙 모두 같은 효과이며, 대시보드 규칙이 우선순위가 높다.

**관리자 접속 URL:**  
`https://kimbap-ui.onrender.com/admin`

### 영향 파일
- `ui/public/_redirects` (신규)

---

## 이슈 #4 — 고객 주문이 관리자 화면에 반영 안 됨

### 증상
고객 앱에서 주문 완료 후 `/admin` 주문 목록에 새 주문이 나타나지 않음

### 원인
**CORS(Cross-Origin Resource Sharing) 차단**

`WebConfig.java`의 허용 Origin 목록에 배포 URL이 없었다:

```java
// 변경 전 — localhost만 허용
.allowedOrigins(
    "http://localhost:5173",
    "http://localhost:4173"
)
```

브라우저는 `https://kimbap-ui.onrender.com`에서 `https://kimbap-server.onrender.com`으로 보내는 요청을 서로 다른 Origin으로 판단한다.  
서버가 해당 Origin을 허용하지 않으면 브라우저가 요청 자체를 차단하므로  
`saveOrder()` API 호출이 실패하고 주문이 저장되지 않는다.

**확인 방법:** 브라우저 개발자 도구(F12) → Console 탭에서 아래와 같은 에러 확인:
```
Access to fetch at 'https://kimbap-server.onrender.com/api/orders'
from origin 'https://kimbap-ui.onrender.com' has been blocked by CORS policy
```

### 해결

`WebConfig.java`에 배포 URL 추가:

```java
// 변경 후
.allowedOrigins(
    "http://localhost:5173",
    "http://localhost:4173",
    "https://kimbap-ui.onrender.com"  // 추가
)
```

### 영향 파일
- `server/src/main/java/com/kimbap/server/config/WebConfig.java` (수정)

---

## 변경 파일 전체 목록

| 파일 | 변경 유형 | 관련 이슈 |
|---|---|---|
| `server/Dockerfile` | 신규 | #1 |
| `server/src/main/java/.../config/RenderEnvironmentPostProcessor.java` | 신규 | #2 |
| `server/src/main/resources/META-INF/spring.factories` | 신규 | #2 |
| `server/src/main/resources/application.properties` | 수정 | #2 |
| `server/src/main/java/.../config/WebConfig.java` | 수정 | #4 |
| `ui/public/_redirects` | 신규 | #3 |
| `ui/src/store/orderStore.js` | 수정 | 배포 전 준비 |
| `ui/.env` | 신규 | 배포 전 준비 |
| `ui/.gitignore` | 수정 | 배포 전 준비 |

---

## 재발 방지 체크리스트

신규 서비스를 Render에 배포할 때 아래 항목을 사전 확인한다:

- [ ] JVM 앱은 Dockerfile 준비 (Language: Docker 선택)
- [ ] DB URL은 `RenderEnvironmentPostProcessor` 방식으로 환경변수 자동 변환
- [ ] SPA는 `public/_redirects` 또는 Render Rewrite 규칙 설정
- [ ] `WebConfig.java` allowedOrigins에 배포 프론트엔드 URL 포함
- [ ] `.env` 파일이 `.gitignore`에 등록되어 있는지 확인
- [ ] `ddl-auto=update` 확인 (재배포 시 데이터 보존)
