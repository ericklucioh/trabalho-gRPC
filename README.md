# Lojinha WASM

Projeto de demonstração de uma lojinha de apps WebAssembly, com foco em comunicação backend-to-backend via gRPC e transferência de módulos WASM para execução no navegador.

## Ideia

A aplicação funciona como um catálogo de ferramentas pequenas e úteis. O usuário escolhe uma tool, envia texto para processamento e recebe o resultado convertido na interface.

## Objetivo

- centralizar ferramentas leves em um único hub
- demonstrar comunicação entre backends com gRPC
- servir módulos WASM a partir do backend
- executar o WASM no navegador
- manter a demo simples para apresentação

## Arquitetura

O sistema é dividido em 4 partes:

1. Aplicação Next.js/Node
2. Serviço Go com gRPC
3. Módulos WASM
4. Navegador

### Fluxo da demo

1. O usuário abre a interface no navegador.
2. A aplicação Next.js renderiza a interface e recebe a requisição do browser.
3. O Node dentro do Next consulta o backend Go via gRPC.
4. O backend devolve catálogo, manifest e bytes do módulo WASM.
5. O Next entrega o pacote ao browser, que baixa o WASM e executa a tool localmente.
6. O resultado aparece na tela.

## Papel de Cada Camada

### Aplicação Next.js/Node

- renderiza a interface no browser
- expõe as rotas HTTP usadas pela tela
- organiza as requisições do usuário
- faz a ponte gRPC com o backend Go
- entrega ao browser os dados necessários para carregar o WASM

### Serviço Go

- expõe o serviço gRPC
- mantém o catálogo das tools
- lê manifestos e artefatos WASM
- entrega metadados e bytes do módulo

### Módulos WASM

- fazem o processamento principal
- rodam no navegador
- podem ser reutilizados por outras ferramentas

### Navegador

- exibe a interface final
- baixa o módulo WASM preparado pelo Next
- executa a tool localmente
- mostra o resultado para o usuário

## Tecnologias

- **Go 1.26.1**
- **gRPC**
- **Protocol Buffers**
- **Node.js 22**
- **Next.js 14**
- **React 18**
- **TypeScript**
- **WebAssembly**
- **Docker**
- **Docker Compose**
- **Rust** para geração dos módulos WASM

## Como Rodar

O projeto roda com:

```bash
docker compose up
```

Depois abra:

- frontend: `http://localhost:3000`
- backend gRPC: `localhost:50051`

## Rodando Localmente

### Backend Go

```bash
cd backend
go run ./cmd/server
```

Variáveis de ambiente úteis:

- `GRPC_PORT` - porta do servidor gRPC, padrão `50051`
- `ARTIFACT_ROOT` - pasta dos artefatos WASM, padrão `./artifacts`
- `SHUTDOWN_TIMEOUT_SECONDS` - tempo de desligamento gracioso, padrão `5`

### Frontend Next.js

```bash
cd frontend
npm ci
GRPC_ENDPOINT=127.0.0.1:50051 npm run dev
```

Depois abra:

- `http://localhost:3000`

## Estrutura Dos Artefatos

Cada tool possui:

- `manifest.json`
- `module.wasm`
- `sha256.txt`

Os artefatos ficam em `backend/artifacts/<tool-id>/`.

## Geração Dos WASM

Se for preciso recompilar os módulos, o projeto possui o workspace Rust em `tools/` e scripts no `Makefile`.

Comandos úteis:

```bash
make test-rust
make build-wasm-tools
make verify-wasm-tools
make ci-tools-wasm
```

## Demonstração Sugerida

1. Abrir a lojinha.
2. Escolher `json2yaml` ou `yaml2json`.
3. Configurar a tool.
4. Enviar texto de entrada.
5. Mostrar o resultado convertido.
