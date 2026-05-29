FROM eclipse-temurin:17-jdk-alpine
WORKDIR /app
COPY "Lab1(Anquilo & Magallanes)/backend/pom.xml" ./
COPY "Lab1(Anquilo & Magallanes)/backend/src" ./src
RUN apk add --no-cache maven && mvn clean package -DskipTests
EXPOSE 8080
CMD ["java", "-jar", "target/ecommerce-backend-1.0.0.jar"]
