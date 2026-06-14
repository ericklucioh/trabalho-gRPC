FROM node:22-bookworm-slim

WORKDIR /app

COPY package.json ./
RUN npm install

COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
ENV GRPC_ENDPOINT=back:50051
ENV PATH=/app/node_modules/.bin:$PATH

EXPOSE 3000

# Next calls the Go backend over gRPC to obtain the WASM package and returns
# it through the prepare route.
CMD ["npm", "run", "dev", "--", "--hostname", "0.0.0.0", "--port", "3000"]
