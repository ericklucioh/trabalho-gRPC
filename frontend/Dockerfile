FROM node:22

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm i

COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
ENV GRPC_ENDPOINT=back:50051

CMD ["npm", "run", "dev"]
