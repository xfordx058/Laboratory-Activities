FROM eclipse-temurin:17-jdk-alpine
RUN apk add --no-cache maven
WORKDIR /app
COPY . .
RUN cd "Lab1(Anquilo & Magallanes)/backend" && mvn clean package -DskipTests && cp target/ecommerce-backend-1.0.0.jar /app/app.jar
RUN rm -rf Lab1*
EXPOSE 8080
CMD ["java", "-jar", "app.jar"]
