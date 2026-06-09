# Catálogo de Ideias para a Lojinha WASM

Este arquivo é só um resumo das ideias de apps para a lojinha de WebAssembly.

## Conversão de Arquivos

- PDF -> PNG
- PDF -> JPG
- PDF -> PDF menor
- MP4 -> WEBM
- WEBM -> MP4
- compressão de vídeo
- WAV -> MP3
- MP3 -> OGG
- compressão de áudio
- SVG -> SVG otimizado
- SVG -> PNG

## Ferramentas de Texto e Código

- formatador de JSON
- validador de JSON Schema
- formatador de SQL
- minificador de JS/CSS/HTML
- analisador de código
- contador de linhas de código
- visualizador de AST
- validador de YAML
- conversor YAML ↔ JSON
- gerador de tipos TypeScript a partir de JSON
- parser de Markdown
- compilador/transpilador pequeno
- validador de regex

## Aplicações Mais Amplas

- playground de linguagens compiladas para WASM

## Tipos de gRPC Considerados

- Unary: 1 request, 1 response
- Server streaming: 1 request, várias respostas
- Client streaming: várias mensagens, 1 resposta no final
- Bidirectional streaming: cliente e servidor trocando mensagens em tempo real

