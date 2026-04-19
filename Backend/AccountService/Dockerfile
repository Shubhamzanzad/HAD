# AccountService must be installed (not just packaged) so PatientService
# and ConsentService can depend on it in their multi-stage builds.
FROM maven:3.9-eclipse-temurin-21-alpine AS builder
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -q
COPY src ./src
RUN mvn clean install -DskipTests -q

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=builder /app/target/AccountService-0.0.1-SNAPSHOT-exec.jar app.jar

ENV DB_URL=jdbc:mysql://gateway01.ap-northeast-1.prod.aws.tidbcloud.com:4000/Account?sslMode=VERIFY_IDENTITY&createDatabaseIfNotExist=true
ENV DB_USERNAME=26dpKbcV8pYtkgB.root
ENV DB_PASSWORD=vZz98MUZRiLrQfe0
ENV GMAIL_USER=zanzadshubham25@gmail.com
ENV GMAIL_APP_PASSWORD="msyf tgby ejrp jrtg"
ENV HOSPITAL_NAME="Fledlucifers Eye care Hospital"
ENV HOSPITAL_ID=IN2210000259
ENV DATABASE_ENCRYPTION_KEY=392d07a0b283c84cafb19e8efbacd43760c2dc4b2416320a084b0c56670f73f8

ARG DISCOVERY_URL=https://medisync-discovery.onrender.com
ARG ABDM_URL=https://medisync-abdm.onrender.com
ENV EUREKA_CLIENT_SERVICEURL_DEFAULTZONE=${DISCOVERY_URL}/eureka/
ENV ABDM_URL=${ABDM_URL}

EXPOSE 8080
ENTRYPOINT ["java", "-Xmx400m", "-jar", "app.jar"]
