# 📦 Gestor de Inventário (100% JavaScript)

Uma aplicação completa de gestão de inventário e controlo de stock desenvolvida **exclusivamente em JavaScript** (Frontend e Backend), sem recurso a outras linguagens ou frameworks externos.

---

## ✨ Funcionalidades Principais

- 🔍 **Pesquisa em Tempo Real**: Pesquisa dinâmica instantânea por Nome, SKU, Fornecedor ou Descrição.
- 🎯 **Filtros Avançados**:
  - Filtro por Categoria (calculado dinamicamente com contagem de produtos).
  - Filtro por Estado de Stock em botões interativos (*Em Stock*, *Stock Baixo*, *Esgotados*).
  - Ordenação por Nome (A-Z / Z-A), Preço (Crescente / Decrescente), Quantidade em stock e Data.
- ➕ **Adicionar Produto**: Modal interativo com validação de campos, gerador automático de SKU e definição de stock mínimo.
- ✏️ **Editar Produto**: Atualização de dados com preenchimento automático.
- 🗑️ **Eliminar Produto**: Modal de confirmação seguro antes de apagar permanentemente.
- ⚡ **Ajuste Rápido de Stock**: Botões `+` e `-` diretamente na listagem para incrementar ou diminuir unidades.
- 📊 **Dashboard de Métricas**:
  - Total de produtos registados
  - Unidades totais em stock
  - Valor total do inventário em Euros (€)
  - Alerta de itens com stock baixo e itens esgotados
- 🔲 **Modos de Visualização**: Alternância com um clique entre visualização em **Tabela** detalhada e **Grelha de Cartões**.
- 📥 **Exportação de Dados**: Exportar o inventário completo para ficheiro `.CSV`.
- 💾 **Persistência Dupla**:
  - Ficheiro JSON no backend (`data/inventory.json`) via servidor Node.js REST API.
  - Modo Offline transparente (LocalStorage) caso abra diretamente o ficheiro `public/index.html`.

---

## 🛠️ Como Iniciar a Aplicação

### Opção 1: Via Linha de Comandos (Node.js)
Abra o terminal na pasta da aplicação e execute:
```bash
node server.js
```
Em seguida, abra o seu navegador e aceda a:
👉 [http://localhost:3000](http://localhost:3000)

### Opção 2: Duplo Clique (Windows)
Basta dar duplo clique no ficheiro:
👉 `iniciar.bat`

---

## 💻 Arquitetura 100% JavaScript

- **Backend (`server.js`)**: Servidor HTTP nativo e API REST construídos em puro JavaScript (Node.js), sem qualquer dependência externa (`node_modules`), garantindo arranque instantâneo.
- **Frontend (`public/app.js`)**:
  - Interface construída 100% em JavaScript via DOM APIs nativas (`document.createElement`).
  - Sistema de estilos e design responsivo injetados dinamicamente via JS.
  - Sistema de Toasts e Modais criados dinamicamente em tempo de execução.
- **Estrutura de Ficheiros**:
  - `server.js` - Servidor e API RESTful em JavaScript
  - `public/index.html` - Ficheiro de entrada ultra-minimalista que invoca o `app.js`
  - `public/app.js` - Todo o Frontend, renderização, estilos, filtros, pesquisa e lógica em JavaScript
  - `data/inventory.json` - Base de dados persistente em formato JSON
  - `iniciar.bat` - Atalho de inicialização rápida no Windows

