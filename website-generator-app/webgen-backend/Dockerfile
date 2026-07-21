# syntax=docker/dockerfile:1

# =========================
# Java build stage
# =========================
FROM eclipse-temurin:25-jdk-noble AS java-builder

WORKDIR /app

COPY pom.xml .
COPY mvnw .
COPY .mvn .mvn
COPY src ./src

RUN chmod +x mvnw && ./mvnw -q -e -DskipTests package

# =========================
# JSX validator stage
# =========================
# The Spring service validates generated JSX through a Node subprocess. Keep
# Node and its dependencies isolated in this stage so local node_modules and
# npm caches never enter the runtime image.
FROM node:22-bookworm-slim AS jsx-validator

WORKDIR /opt/jsx-validator

COPY scripts/package.json scripts/package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts

COPY scripts/validate-jsx.js scripts/validate-jsx.test.js ./
COPY scripts/lib ./lib

# Catch missing modules or a broken validator before an image can be produced.
RUN node --test validate-jsx.test.js

# =========================
# Runtime stage
# =========================
FROM eclipse-temurin:25-jre-noble

WORKDIR /app

# Explicit paths keep validation independent of the container's PATH and
# working directory. Both values can still be overridden by ECS if needed.
ENV JSX_VALIDATOR_NODE_PATH=/usr/local/bin/node \
    JSX_VALIDATOR_SCRIPT_PATH=/app/scripts/validate-jsx.js

COPY --from=java-builder /app/target/*.jar app.jar

# Copy the pinned Node runtime and only the validator's production files.
COPY --from=jsx-validator /usr/local/bin/node /usr/local/bin/node
COPY --from=jsx-validator /opt/jsx-validator/node_modules ./scripts/node_modules
COPY --from=jsx-validator /opt/jsx-validator/validate-jsx.js ./scripts/validate-jsx.js
COPY --from=jsx-validator /opt/jsx-validator/lib ./scripts/lib

# Install Playwright Chromium browser
RUN java -cp app.jar -Dloader.main=com.microsoft.playwright.CLI org.springframework.boot.loader.launch.PropertiesLauncher install --with-deps chromium

# Verify that the final runtime, not just the build stage, can load every
# validator dependency.
RUN "$JSX_VALIDATOR_NODE_PATH" -e \
    "require('/app/scripts/lib/ast-checks'); require('/app/scripts/lib/smoke-render');"

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
