FROM golang:1.26.1-bookworm

WORKDIR /app

COPY go.mod go.sum ./
COPY cmd ./cmd
COPY internal ./internal
COPY gen ./gen
COPY third_party ./third_party

RUN go build -o server ./cmd/server

ENV ARTIFACT_ROOT=/artifacts
ENV GRPC_PORT=50051
ENV SHUTDOWN_TIMEOUT_SECONDS=5

EXPOSE 50051

CMD ["./server"]
