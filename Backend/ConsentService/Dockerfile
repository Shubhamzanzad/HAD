FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY target/ConsentService-0.0.1-SNAPSHOT.jar app.jar

ENV DB_URL=jdbc:mysql://gateway01.ap-northeast-1.prod.aws.tidbcloud.com:4000/Consent?sslMode=VERIFY_IDENTITY&createDatabaseIfNotExist=true
ENV DB_USERNAME=26dpKbcV8pYtkgB.root
ENV DB_PASSWORD=vZz98MUZRiLrQfe0
ENV RABBITMQ_HOST=puffin.rmq2.cloudamqp.com
ENV RABBITMQ_PORT=5672
ENV RABBITMQ_USERNAME=qtsymore
ENV RABBITMQ_PASSWORD=PsvZueVskV2QoDMKxEzD-iqbMA5VJiQj
ENV RABBITMQ_VHOST=qtsymore
ENV HOSPITAL_NAME="Fledlucifers Eye care Hospital"
ENV HOSPITAL_ID=IN2210000259
ENV DATABASE_ENCRYPTION_KEY=392d07a0b283c84cafb19e8efbacd43760c2dc4b2416320a084b0c56670f73f8

ARG DISCOVERY_URL=https://medisync-discovery.onrender.com
ARG ABDM_URL=https://medisync-abdm.onrender.com
ENV EUREKA_CLIENT_SERVICEURL_DEFAULTZONE=${DISCOVERY_URL}/eureka/
ENV ABDM_URL=${ABDM_URL}

EXPOSE 8080
ENTRYPOINT ["java", "-Xmx400m", "-jar", "app.jar"]
