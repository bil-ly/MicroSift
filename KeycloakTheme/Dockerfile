# --- STAGE 1: Build the React Theme into a Java .jar file ---
FROM docker.io/library/node:22-alpine AS theme-builder

RUN apk add --no-cache maven openjdk21-jdk

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY . .
RUN npm run build-keycloak-theme


# --- STAGE 2: Bake the .jar into the Official Keycloak Image ---
FROM quay.io/keycloak/keycloak:26.8.1

# Copy ONLY the finished .jar file from Stage 1 into Keycloak's providers folder
COPY --from=theme-builder /app/dist_keycloak/*.jar /opt/keycloak/providers/

# Enable Postgres driver and health endpoints (/health/ready, /health/live)
ENV KC_DB=postgres \
    KC_HEALTH_ENABLED=true \
    KC_METRICS_ENABLED=true

# Pre-build Keycloak so it registers our "microsift" theme and Postgres driver
RUN /opt/keycloak/bin/kc.sh build

EXPOSE 8080 9000

ENTRYPOINT ["/opt/keycloak/bin/kc.sh"]