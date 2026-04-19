FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY target/DiscoveryServer-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8761
ENTRYPOINT ["java", "-Xmx400m", "-jar", "app.jar"]
