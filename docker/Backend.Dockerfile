# ---- Build Stage ----
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app

# Download dependencies first (caching layer)
COPY Backend/pom.xml .
RUN mvn dependency:go-offline -B

# Build application
COPY Backend/src ./src
RUN mvn clean package -DskipTests

# ---- Run Stage ----
FROM eclipse-temurin:17-jre
WORKDIR /app

# Create a non-root user for security
RUN groupadd -r app && useradd -r -g app app

COPY --from=build /app/target/*.jar app.jar

USER app
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
