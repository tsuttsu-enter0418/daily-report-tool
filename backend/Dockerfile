# backend/Dockerfile
FROM openjdk:17-jdk-slim

WORKDIR /app

# Maven Wrapperをコピー
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN chmod +x ./mvnw

# 依存関係の事前ダウンロード（キャッシュ効率化）
RUN ./mvnw dependency:resolve

# ソースコードをコピー
COPY src/ ./src/

EXPOSE 8080

# 開発用起動コマンド
CMD ["./mvnw", "spring-boot:run"]