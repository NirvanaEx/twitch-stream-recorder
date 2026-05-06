FROM node:20-alpine AS build
WORKDIR /app

COPY apps/api/package*.json ./
RUN npm install

COPY apps/api/prisma ./prisma
COPY apps/api ./
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine AS runtime
WORKDIR /app

RUN apk add --no-cache ffmpeg python3 py3-pip \
  && pip3 install --break-system-packages --no-cache-dir streamlink

COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma

EXPOSE 3001
CMD ["sh", "-c", "npx prisma db push && node dist/main.js"]
