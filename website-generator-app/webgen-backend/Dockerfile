# =========================
# Build Stage
# =========================

# Set base image
FROM eclipse-temurin:25-jdk-noble AS builder

# Work inside app direcotry (located in docker container)
WORKDIR /app

#  ---- Copy files into /app/ ----
# For dependecies
COPY pom.xml .
# For source code
COPY src ./src
# For maven wrapper
COPY mvnw .
COPY .mvn .mvn

# Build the jar file | /app/target/<project>.jar
RUN chmod +x mvnw
RUN ./mvnw -q -e -DskipTests package

# =========================
# Runtime stage
# =========================
FROM eclipse-temurin:25-jre-noble

WORKDIR /app

# Copy only the final JAR from the builder stage
COPY --from=builder /app/target/*.jar app.jar

# Install Playwright Chromium browser
RUN java -cp app.jar -Dloader.main=com.microsoft.playwright.CLI org.springframework.boot.loader.launch.PropertiesLauncher install --with-deps chromium

# Expose your Spring Boot port
EXPOSE 8080

# Run the Spring Boot app
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
