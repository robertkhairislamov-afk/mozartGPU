FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --prefer-offline
COPY . .
RUN npm run build

FROM nginx:1.27-alpine AS runner
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.console.conf /etc/nginx/conf.d/console.conf
COPY --from=builder /app/dist /usr/share/nginx/html/console
EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]
