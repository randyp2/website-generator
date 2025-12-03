# =========================
# Build Stage
# =========================

FROM eclipse-temurin:25-jdk AS builder

# Work inside app direcotry (located in docker container)
WORKDIR /app

# Copy files into /app/
COPY pom.xml .
COPY src ./src
COPY mvnw .
COPY .mvn .mvn

# Build the jar file inside Docker container
RUN ./mvnw -q -e -DskipTests package

# =========================
# Runtime stage
# =========================
FROM eclipse-temurin:25-jre

WORKDIR /app

# Copy only the final JAR from the builder stage
COPY --from=builder /app/target/*.jar app.jar

# Expose your Spring Boot port
EXPOSE 8080

# Run the Spring Boot app
ENTRYPOINT ["java", "-jar", "/app/app.jar"]