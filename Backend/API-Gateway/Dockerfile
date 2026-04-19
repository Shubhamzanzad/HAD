FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY target/API-Gateway-0.0.1-SNAPSHOT.jar app.jar

ARG DISCOVERY_URL=https://medisync-discovery.onrender.com
ARG FRONTEND_URL=https://medisync-frontend.onrender.com
ENV EUREKA_CLIENT_SERVICEURL_DEFAULTZONE=${DISCOVERY_URL}/eureka/
ENV FRONTEND_URL=${FRONTEND_URL}

EXPOSE 9005
ENTRYPOINT ["java", "-Xmx400m", "-jar", "app.jar"]
