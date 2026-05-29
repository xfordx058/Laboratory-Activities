FROM eclipse-temurin:17-jdk-alpine
RUN apk add --no-cache maven
WORKDIR /app
COPY Lab1(Anquilo & Magallanes)/backend .
RUN mvn clean package -DskipTests
EXPOSE 8080
CMD ["java", "-jar", "target/ecommerce-backend-1.0.0.jar"]
