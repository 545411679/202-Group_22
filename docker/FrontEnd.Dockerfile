# ---- Build Stage ----
FROM node:18-alpine AS build
WORKDIR /app

COPY FrontEnd/package.json FrontEnd/package-lock.json ./
RUN npm ci

COPY FrontEnd/ .
RUN npm run build

# ---- Run Stage ----
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
