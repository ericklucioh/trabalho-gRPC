# Frontend

Frontend Next.js da demo da Lojinha WASM.

## Estado atual

- Uma tela única.
- Duas tools no catálogo MVP.
- Browser falando com rotas do Next.
- Next tentando o backend gRPC e mantendo fallback local quando ele estiver indisponível.
- Recebimento do pacote WASM codificado em base64 no fluxo de preparação.
- Conversão local com validação antes do envio.

## Integração

- O adapter do browser fala com `app/api`.
- O `Next` resolve o catálogo e o pacote por gRPC em `lib/backend-tool-gateway.ts`.
- O runtime local segue isolado para facilitar a troca pelo carregamento real do WASM.
- Os contratos do browser ficam em `lib/contracts.ts`.
- As formas do gRPC/protobuf ficam em `lib/proto-contract.ts` e devem acompanhar `PROTOBUF_CONTRACT.md`.

## Ambiente

- `GRPC_ENDPOINT` aponta para o backend Go.
- O valor padrão local é `127.0.0.1:50051`.
- Em Docker Compose, o endpoint deve apontar para o serviço `back:50051`.
