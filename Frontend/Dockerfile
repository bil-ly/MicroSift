# --- STAGE 1: Build the React + TypeScript app ---
FROM docker.io/library/node:22-alpine AS builder

WORKDIR /app

# Copy lockfiles first so npm ci is cached unless dependencies change
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

# Copy source code and build
COPY . .

# Vite bakes VITE_* variables into the JS bundle at build time
ARG VITE_KEYCLOAK_URL=http://auth.localhost:8088
ARG VITE_KEYCLOAK_REALM=microsift
ARG VITE_KEYCLOAK_CLIENT_ID=microsift-frontend
ENV VITE_KEYCLOAK_URL=${VITE_KEYCLOAK_URL} \
    VITE_KEYCLOAK_REALM=${VITE_KEYCLOAK_REALM} \
    VITE_KEYCLOAK_CLIENT_ID=${VITE_KEYCLOAK_CLIENT_ID}

RUN npm run build


# --- STAGE 2: Serve static files with unprivileged Nginx ---
FROM docker.io/nginxinc/nginx-unprivileged:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]