# Catálogo de Ideias para a Lojinha WASM

Este arquivo resume o catalogo de tools e a direcao escolhida para o MVP.

## MVP Escolhido

- `json2yaml`
- `yaml2json`

## Fluxo De Transporte

- `Go` fala com `Next` por gRPC.
- `Next` fala com o browser por REST.
- `WebSocket` pode ser usado depois para status em tempo real.
- O browser baixa o WASM e executa a tool localmente.

## Conversao De Arquivos

- PDF -> PNG
- PDF -> JPG
- PDF -> PDF menor
- MP4 -> WEBM
- WEBM -> MP4
- compressao de video
- WAV -> MP3
- MP3 -> OGG
- compressao de audio
- SVG -> SVG otimizado
- SVG -> PNG

## Ferramentas De Texto E Codigo

- formatador de JSON
- validador de JSON Schema
- formatador de SQL
- minificador de JS/CSS/HTML
- analisador de codigo
- contador de linhas de codigo
- visualizador de AST
- validador de YAML
- conversor YAML ↔ JSON
- gerador de tipos TypeScript a partir de JSON
- parser de Markdown
- compilador/transpilador pequeno
- validador de regex

## Aplicacoes Mais Amplas

- playground de linguagens compiladas para WASM

## Tipos De gRPC Considerados

- Unary: 1 request, 1 response
- Server streaming: 1 request, varias respostas
- Client streaming: varias mensagens, 1 resposta no final
- Bidirectional streaming: cliente e servidor trocando mensagens em tempo real

