# ---- build stage: compile the Vite/React app to static files ----
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Baked into the JS bundle at build time — must be a URL the USER'S BROWSER
# can reach (the browser runs on the host, not inside the compose network),
# so this stays http://localhost:8000, not the "backend" service name.
ARG VITE_API_BASE_URL=http://localhost:8000
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build

# ---- serve stage: nginx serving the built static files ----
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
