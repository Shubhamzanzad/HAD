FROM maven:3.9-eclipse-temurin-21-alpine AS builder
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -q
COPY src ./src
RUN mvn clean package -DskipTests -q

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=builder /app/target/API-Gateway-0.0.1-SNAPSHOT.jar app.jar

ARG DISCOVERY_URL=https://medisync-discovery.onrender.com
ARG FRONTEND_URL=https://medisync-frontend.onrender.com
ENV EUREKA_CLIENT_SERVICEURL_DEFAULTZONE=${DISCOVERY_URL}/eureka/
ENV FRONTEND_URL=${FRONTEND_URL}

EXPOSE 9005
ENTRYPOINT ["java", "-Xmx400m", "-jar", "app.jar"]
