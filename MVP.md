# MVP

## Objetivo

Fechar um recorte executavel do projeto para a demo da faculdade, mantendo:

- comunicacao backend-to-backend com gRPC
- transferencia de artefatos WASM
- execucao do WASM no navegador
- fluxo simples para apresentacao

## Escopo Fechado

- Uma pagina no frontend.
- Uma lista inicial com duas tools:
  - `json2yaml`
  - `yaml2json`
- Um botao para configurar a tool escolhida.
- Um fluxo de requisicao para buscar manifest e artefato WASM.
- Download do WASM no navegador.
- Instanciacao da tool em JS no browser.
- Mensagem de `tool configurada`.
- Campo de entrada de texto.
- Area de resultado em outro `div`.
- Conversao executada localmente no navegador.

## Arquitetura Do MVP

- Browser fala com `Next` por REST.
- `Next` pode usar WebSocket apenas para status, se precisar.
- `Next` fala com `Go` por gRPC.
- `Go` fornece catalogo, manifestos e metadados dos artefatos.
- O browser baixa o WASM e executa a tool localmente.

## Fluxo Da Demo

1. Abrir a pagina.
2. Carregar a lista de tools.
3. Selecionar `json2yaml` ou `yaml2json`.
4. Clicar em `configurar tool`.
5. `Next` consultar `Go` via gRPC.
6. Receber manifest e dados do artefato.
7. Baixar e instanciar o WASM no navegador.
8. Mostrar `tool configurada`.
9. Colar o texto de entrada.
10. Exibir o resultado convertido.

## Responsabilidades Por Camada

### Browser

- exibir a lista de tools
- permitir selecao da tool
- baixar o WASM
- executar a conversao local
- mostrar entrada, status e saida

### Next

- expor a API HTTP para o browser
- traduzir requisicoes web para gRPC
- repassar metadados de tool
- manter a camada de interface simples

### Go

- expor gRPC para o `Next`
- manter o catalogo de tools
- resolver manifestos e artefatos
- ser a fonte de verdade para os dados da tool

### WASM

- executar a transformacao principal
- ser baixado sob demanda
- rodar no browser depois de validado

## Regras Do MVP

- Nao executar WASM no backend.
- Nao adicionar autenticao.
- Nao criar multi-page routing.
- Nao expandir o catalogo antes da demo.
- Nao misturar responsabilidade de browser com backend.
- Nao deixar o `Next` virar logica de dominio.

## Critérios De Pronto

- A pagina carrega sem erro.
- A lista de tools aparece.
- A tool pode ser configurada.
- O WASM baixa e instancia no navegador.
- A conversao funciona para as duas tools.
- O resultado aparece em uma area separada.
- O fluxo mostra claramente o uso de gRPC entre `Next` e `Go`.

