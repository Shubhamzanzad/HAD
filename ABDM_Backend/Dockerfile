FROM maven:3.9-eclipse-temurin-21-alpine AS builder
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -q
COPY src ./src
RUN mvn clean package -DskipTests -q

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=builder /app/target/ABDM_Backend-0.0.1-SNAPSHOT.jar app.jar

ENV DB_URL=jdbc:mysql://gateway01.ap-northeast-1.prod.aws.tidbcloud.com:4000/Abdm?sslMode=VERIFY_IDENTITY&createDatabaseIfNotExist=true
ENV DB_USERNAME=26dpKbcV8pYtkgB.root
ENV DB_PASSWORD=vZz98MUZRiLrQfe0
ENV RABBITMQ_HOST=puffin.rmq2.cloudamqp.com
ENV RABBITMQ_PORT=5672
ENV RABBITMQ_USERNAME=qtsymore
ENV RABBITMQ_PASSWORD=PsvZueVskV2QoDMKxEzD-iqbMA5VJiQj
ENV RABBITMQ_VHOST=qtsymore

ARG DISCOVERY_URL=https://medisync-discovery.onrender.com
ENV EUREKA_CLIENT_SERVICEURL_DEFAULTZONE=${DISCOVERY_URL}/eureka/

EXPOSE 9009
ENTRYPOINT ["java", "-Xmx400m", "-jar", "app.jar"]
