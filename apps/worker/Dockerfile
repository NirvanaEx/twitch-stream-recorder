FROM node:22-alpine AS build
WORKDIR /app

COPY apps/worker/package*.json ./
RUN npm install

COPY apps/worker ./
RUN npm run build

FROM node:22-alpine AS runtime
WORKDIR /app

COPY --from=build /app/package*.json ./
RUN npm install --omit=dev
COPY --from=build /app/dist ./dist

EXPOSE 3010
CMD ["node", "dist/index.js"]

