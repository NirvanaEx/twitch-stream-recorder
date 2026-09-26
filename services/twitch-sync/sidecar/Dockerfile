FROM tsr-sync-base:20260923
COPY dist/ /app/sync/
WORKDIR /app/sync
ENV PORT=3002 TSR_SOURCE_API_ORIGIN=http://api:3001
EXPOSE 3002
CMD ["node", "/app/sync/server.cjs"]
