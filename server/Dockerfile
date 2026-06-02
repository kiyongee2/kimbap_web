# ── 1단계: 빌드 ──────────────────────────────────────────────
FROM eclipse-temurin:21-jdk AS builder

WORKDIR /app

# 의존성 캐시를 위해 pom.xml 먼저 복사
COPY pom.xml .
COPY mvnw .
COPY .mvn .mvn

RUN chmod +x mvnw
RUN ./mvnw dependency:go-offline -q

# 소스 복사 후 빌드
COPY src ./src
RUN ./mvnw clean package -DskipTests -q

# ── 2단계: 실행 ──────────────────────────────────────────────
FROM eclipse-temurin:21-jre

WORKDIR /app

COPY --from=builder /app/target/kimbap-server-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
