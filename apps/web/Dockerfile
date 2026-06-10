FROM node:22-alpine AS build
WORKDIR /app

COPY apps/web/package*.json ./
RUN npm install

COPY apps/web ./
RUN npm run build

FROM node:22-alpine AS runtime
WORKDIR /app

COPY --from=build /app/package*.json ./
RUN npm install --omit=dev
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public

EXPOSE 3000
CMD ["npm", "run", "start"]

