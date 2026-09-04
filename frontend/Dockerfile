# --- TaskFlow Frontend Dockerfile ---
# Multi-stage build: compile the Vite app, then serve the static output
# with a lightweight Nginx server. This also sets you up nicely for the
# "Nginx reverse proxy" DevOps exercise later.

# Stage 1: build
FROM node:20-slim AS build

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .

# VITE_API_URL is baked into the static build at build time, since Vite
# resolves environment variables during the build step, not at runtime.
ARG VITE_API_URL=http://127.0.0.1:8000
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# Stage 2: serve
FROM nginx:1.27-alpine

COPY --from=build /app/dist /usr/share/nginx/html

# Basic Nginx config that supports client-side routing (React Router):
# any unknown path falls back to index.html.
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget -q --spider http://127.0.0.1:80 || exit 1

CMD ["nginx", "-g", "daemon off;"]
