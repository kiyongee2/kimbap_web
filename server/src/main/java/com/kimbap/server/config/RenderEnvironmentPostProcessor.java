package com.kimbap.server.config;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.net.URI;
import java.util.HashMap;
import java.util.Map;

/**
 * Render.com의 DATABASE_URL 환경변수는 postgresql://user:pass@host:port/db 형식으로 제공된다.
 * Spring Boot의 JDBC는 jdbc:postgresql:// 형식이 필요하므로 자동 변환한다.
 */
public class RenderEnvironmentPostProcessor implements EnvironmentPostProcessor {

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        String databaseUrl = System.getenv("DATABASE_URL");

        if (databaseUrl == null) {
            return;
        }

        if (!databaseUrl.startsWith("postgresql://") && !databaseUrl.startsWith("postgres://")) {
            return; // 이미 jdbc: 형식이면 변환 불필요
        }

        try {
            // URI 파싱을 위해 postgresql:// → http:// 로 임시 치환
            URI uri = new URI(databaseUrl
                    .replace("postgresql://", "http://")
                    .replace("postgres://", "http://"));

            String host = uri.getHost();
            int port = uri.getPort() == -1 ? 5432 : uri.getPort();
            String path = uri.getPath();   // /dbname
            String userInfo = uri.getUserInfo(); // user:pass

            String jdbcUrl = "jdbc:postgresql://" + host + ":" + port + path;

            Map<String, Object> props = new HashMap<>();
            props.put("spring.datasource.url", jdbcUrl);

            if (userInfo != null && userInfo.contains(":")) {
                String[] parts = userInfo.split(":", 2);
                props.put("spring.datasource.username", parts[0]);
                props.put("spring.datasource.password", parts[1]);
            }

            environment.getPropertySources().addFirst(
                    new MapPropertySource("renderDatabaseUrl", props)
            );

        } catch (Exception e) {
            // 파싱 실패 시 Spring Boot 기본 처리에 위임
        }
    }
}
