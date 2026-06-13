# Frontend

Frontend Next.js da demo da Lojinha WASM.

## Estado atual

- Uma tela única.
- Duas tools no catálogo MVP.
- Adapter mockado e substituível.
- Simulação de recebimento do pacote WASM no browser.
- Conversão local com validação antes do envio.

## Integração futura

- O adapter de catálogo pode ser trocado por um client de Next para gRPC depois.
- O runtime local já está isolado para facilitar a substituição pelo carregamento real do WASM.
- Os contratos do browser ficam em `lib/contracts.ts`.
- As formas do gRPC/protobuf ficam em `lib/proto-contract.ts` e devem acompanhar `PROTOBUF_CONTRACT.md` quando o backend existir.
