FROM node:22.0.0-bookworm-slim

WORKDIR /app

COPY package.json package-lock.json* ./
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
ENV GRPC_ENDPOINT=back:50051

EXPOSE 3000

CMD ["sh", "-lc", "npm ci --ignore-scripts --no-audit --no-fund && npm run dev -- --hostname 0.0.0.0 --port 3000"]
