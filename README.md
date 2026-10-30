# Gestor de Inventário

Aplicação web para controlo de stock e gestão de artigos, desenvolvida em JavaScript (Node.js no backend e Vanilla JS no frontend).

## Funcionalidades

- **Pesquisa em tempo real**: Filtragem instantânea por nome de produto, código SKU, fornecedor e descrição.
- **Filtros e ordenação**:
  - Filtro por categoria com contagem automática de artigos.
  - Filtro por estado de stock (Em Stock, Stock Baixo e Esgotado).
  - Ordenação por nome, preço, quantidade em stock e data de atualização.
- **Gestão de produtos**:
  - Adição de novos produtos com gerador de SKU e validação de campos.
  - Edição de informações existentes.
  - Remoção de produtos com confirmação antes da eliminação.
  - Ajuste rápido de quantidade (+ / -) diretamente na listagem.
- **Painel de métricas**:
  - Total de produtos registados.
  - Total de unidades disponíveis.
  - Valor financeiro global do inventário.
  - Alertas de rutura e nível baixo de stock.
- **Visualização**:
  - Alternância entre vista em tabela e vista em grelha.
- **Exportação**:
  - Descarregamento dos dados em formato CSV.
- **Armazenamento**:
  - Persistência em ficheiro JSON no servidor.
  - Suporte a funcionamento local/offline com fallback em LocalStorage.

## Requisitos

- [Node.js](https://nodejs.org/) (versão 18 ou superior)

## Instalação e Execução

1. Clone o repositório:
```bash
git clone https://github.com/angeldfdr-svg/gestor-inventario-js.git
cd gestor-inventario-js
```

2. Inicie o servidor:
```bash
node server.js
```

3. Abra o navegador em:
```
http://localhost:3000
```

*(No Windows, também é possível iniciar executando o ficheiro `iniciar.bat`)*

## Estrutura do Projeto

```text
├── data/
│   └── inventory.json      # Base de dados em formato JSON
├── public/
│   ├── app.js              # Lógica da interface, estilos e gestão de estado
│   └── index.html          # Ponto de entrada HTML
├── iniciar.bat             # Script de arranque para Windows
├── package.json            # Metadados e scripts do projeto
├── README.md               # Documentação
└── server.js               # Servidor HTTP e API REST
```

## Licença

MIT
