FROM node:22-bookworm-slim

WORKDIR /app

COPY package.json ./
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
ENV GRPC_ENDPOINT=back:50051
ENV PATH=/app/node_modules/.bin:$PATH

EXPOSE 3000

CMD ["sh", "-lc", "npm install && npm run dev -- --hostname 0.0.0.0 --port 3000"]
