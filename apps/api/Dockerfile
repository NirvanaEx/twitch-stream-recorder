FROM node:22-alpine AS build
WORKDIR /app

COPY apps/api/package*.json ./
RUN npm install

COPY apps/api/prisma ./prisma
COPY apps/api ./
RUN npx prisma generate
RUN npm run build

FROM node:22-alpine AS runtime
WORKDIR /app

# rclone uploads finished recordings to the archive tier. Not a convenience:
# writing them through the mount stages every byte in its VFS cache, on the
# same disk the archive is meant to drain (see ArchiveStorageService).
RUN apk add --no-cache ffmpeg python3 py3-pip rclone \
  && pip3 install --break-system-packages --no-cache-dir streamlink

COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
# Credential-free Kick lookups borrow streamlink's HTTP session (see the script).
COPY --from=build /app/scripts ./scripts

EXPOSE 3001
# Retry the schema sync instead of dying: when postgres is still warming up
# after a reboot, a one-shot "db push" used to crash-loop the container and
# the panel answered 502 the whole time. "exec" hands PID 1 to node so it
# receives SIGTERM and shuts down recordings cleanly.
CMD ["sh", "-c", "until npx prisma db push; do echo 'prisma db push failed, retrying in 5s...'; sleep 5; done; exec node dist/main.js"]
