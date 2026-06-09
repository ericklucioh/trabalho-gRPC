# Lojinha WASM

## Ideia

A proposta é criar uma lojinha de apps WebAssembly voltada para ferramentas pequenas, úteis e rápidas, com foco em conversão, validação, formatação e manipulação de arquivos.

A interface funciona como um catálogo de aplicações. O usuário escolhe uma ferramenta, envia um arquivo ou texto, e o sistema executa o processamento usando módulos WASM.

O objetivo é mostrar uma arquitetura distribuída com gRPC, mas com o processamento principal concentrado em módulos especializados.

## Objetivo do Sistema

- centralizar várias ferramentas leves em um único hub
- permitir reutilização de módulos por tipo de arquivo
- demonstrar comunicação backend-to-backend com gRPC
- manter a experiência simples para o usuário final
- usar WASM como base para processamento isolado e portátil

## Proposta de Arquitetura

### Visão Geral

O sistema pode ser dividido em 4 partes:

1. Frontend
2. API principal
3. Serviços especializados
4. Módulos WASM

### Fluxo

1. O usuário escolhe um app na lojinha.
2. O frontend envia a requisição para a API principal.
3. A API valida o pedido e encaminha para o serviço responsável.
4. O serviço acessa ou coordena o módulo WASM correto.
5. O resultado volta para a API.
6. A API devolve a resposta para o frontend.

## Papel de Cada Camada

### Frontend

- exibe a lista de apps
- recebe upload de arquivos ou entrada de texto
- mostra pré-visualização e resultado final
- exibe o status de processamento

### API Principal

- autentica e organiza as requisições
- decide qual serviço executar
- faz a orquestração entre os serviços
- registra metadados da execução

### Serviços Especializados

- cada serviço resolve um tipo de tarefa
- exemplos:
  - conversão de arquivos
  - validação
  - formatação
  - compressão
  - parsing
- os serviços se comunicam via gRPC

### Módulos WASM

- fazem o processamento principal
- ficam isolados do restante do sistema
- podem ser reutilizados por diferentes apps
- ajudam a manter portabilidade e previsibilidade

## Apps da Lojinha

As ideias iniciais do catálogo incluem:

- conversores de imagem e documento
- compressão de vídeo e áudio
- ferramentas de formato e validação de dados
- utilitários para código e texto
- playground de linguagens compiladas para WASM

## Por Que Faz Sentido para gRPC

O trabalho pede foco em backend-to-backend, e essa arquitetura encaixa bem porque:

- a API não faz todo o processamento sozinha
- os serviços trocam dados e tarefas entre si
- gRPC é usado como canal rápido e tipado entre backends
- o sistema pode crescer por módulos sem virar um monólito

## Desafios Técnicos

### 1. Tamanho e custo dos módulos WASM

Alguns módulos podem ficar pesados, principalmente os de mídia e conversão avançada.

### 2. Transferência de arquivos

O sistema precisa lidar bem com upload, download e retorno de arquivos processados.

### 3. Integração entre linguagens

Se os serviços forem escritos em linguagens diferentes, a integração precisa ser consistente.

### 4. Limites do navegador

Nem toda ferramenta vai rodar bem direto no cliente. Algumas vão depender de backend.

### 5. Padronização dos resultados

Cada app precisa devolver resposta em um formato previsível para o frontend.

## Riscos e Cuidados

- evitar escopo grande demais
- priorizar poucas ferramentas demonstráveis
- manter a demo simples e estável
- não depender de funcionalidades difíceis de mostrar ao vivo
- escolher ferramentas com saída clara e visual

## Demonstração Sugerida

Uma demonstração boa para apresentação pode seguir este roteiro:

1. abrir a lojinha
2. escolher um app
4. mostrar a chamada entre frontend, API e serviço
5. mostrar o resultado final
6. repetir com outro formato ou outra ferramenta

## Direção do Projeto

A ideia principal não é construir só um conversor isolado.

A proposta é mostrar uma plataforma modular de ferramentas WASM, onde cada app resolve uma tarefa pequena, e o backend com gRPC organiza o fluxo entre os serviços.

