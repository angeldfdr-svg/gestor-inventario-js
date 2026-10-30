# Gestor de Inventário TI — Aplicação Desktop

Aplicação nativa para computador (**Desktop App**) desenvolvida em JavaScript (**Node.js + Electron**) para a gestão integral de ativos de Tecnologias de Informação, configurada e povoada com **200 Equipamentos**, **50 Modelos** e **5 Marcas Homologadas**.

---

## Como Abrir a Aplicação no seu Computador

A aplicação pode ser iniciada imediatamente com um simples duplo clique:

| Método | Como Abrir | Descrição |
|---|---|---|
| **Executável Direto** | Duplo clique em **`Gestor-Inventario.exe`** | Abre imediatamente a janela de desktop nativa sem janelas pretas. |
| **Atalho Windows** | Duplo clique em **`iniciar.bat`** | Lança o executável da aplicação de secretária. |
| **Arranque Silencioso** | Duplo clique em **`Abrir-Gestor-Inventario.vbs`** | Execução 100% invisível em segundo plano. |
| **Linha de Comandos** | `npm start` | Inicia o Electron a partir do terminal. |
| **Modo Consola (CLI)** | Duplo clique em **`iniciar-terminal.bat`** | Versão em modo de texto interativo no próprio terminal. |

---

## Estrutura do Inventário Registado

### 5 Marcas Homologadas
1. **Dell Technologies** (Líder em computadores empresariais, servidores PowerEdge e monitores UltraSharp)
2. **Apple Inc.** (MacBooks Pro/Air Apple Silicon, Mac Studio, iMacs, iPads Pro e iPhones)
3. **HP Inc.** (Portáteis corporativos EliteBook/ProBook, workstations ZBook e impressoras LaserJet)
4. **Lenovo** (Linha profissional ThinkPad, estações ThinkStation e monitores ThinkVision)
5. **Cisco Systems** (Comutadores de rede Catalyst/Meraki, pontos de acesso Wi-Fi 6 e comunicações IP)

### 50 Modelos Homologados (10 por Marca)
- **Dell (10):** Latitude 5440, Latitude 7440 Ultralight, XPS 15 9530, XPS 13 Plus, Precision 3581, OptiPlex 7010 Micro, PowerEdge R750, UltraSharp U2723QE, Professional P2422H, Thunderbolt Dock WD19TBS.
- **Apple (10):** MacBook Pro 14" M3 Pro, MacBook Pro 16" M3 Max, MacBook Air 13" M2, MacBook Air 15" M2, iMac 24" M3, Mac Studio M2 Max, Mac mini M2 Pro, iPad Pro 12.9", iPad Air 10.9", iPhone 15 Pro.
- **HP (10):** EliteBook 840 G10, EliteBook 650 G10, ProBook 450 G10, ZBook Power G10, ProDesk 400 G9 SFF, LaserJet Pro M404dn, Color LaserJet Pro 4302fdw, ScanJet Pro 3000 s4, Monitor E24 G4, Thunderbolt Dock G4 120W.
- **Lenovo (10):** ThinkPad T14 Gen 4, ThinkPad X1 Carbon Gen 11, ThinkPad P16s Gen 2, ThinkPad L15 Gen 4, ThinkCentre M70q Tiny Gen 4, ThinkStation P360 Tower, ThinkVision P27h-20, ThinkVision T24i-30, Tab P12 Pro, Universal USB-C Dock.
- **Cisco (10):** Catalyst 9200L-48P, Catalyst 9300-24T, Catalyst 1000-8P, Meraki MS120-24P, Meraki MR46 Wi-Fi 6, Meraki MR36 Wi-Fi 6, ISR 4331 Router, IP Phone 8845, IP Phone 7841, Webex Room Kit Mini.

### 200 Equipamentos Registados (4 Unidades por cada Modelo)
- Cada unidade possui:
  - **Etiqueta de Património Única:** `PAT-0001` até `PAT-0200`
  - **Número de Série Único:** Ex: `SN-DELL-01-0107`, `SN-APPL-11-0114`, etc.
  - **Estado Operacional:**
    - `Em Uso` (130 unidades atribuídas com nome de colaborador e departamento)
    - `Disponível` (40 unidades armazenadas prontas no Armazém Central)
    - `Em Manutenção` (16 unidades em assistência técnica / laboratório)
    - `Em Reserva` (14 unidades Hot-Spare de salvaguarda)
  - **Valor Patrimonial Individual em Euros** (~282.000 € no total)
  - **Localização física e data de aquisição**

---

## Funcionalidades da Aplicação Desktop

1. **Janela de Aplicação Nativa:**
   - Barra de menus nativa do sistema operativo (`Inventário`, `Vista`, `Ferramentas`, `Editar`, `Ajuda`).
   - Atalhos de teclado globais:
     - `Ctrl + 1` -> Painel Geral
     - `Ctrl + 2` -> Equipamentos
     - `Ctrl + 3` -> Modelos
     - `Ctrl + 4` -> Marcas
     - `Ctrl + E` -> Exportar CSV (abre a janela do Windows para escolher onde guardar)
     - `Ctrl + Shift + S` -> Exportar Backup JSON
     - `Ctrl + O` -> Importar Backup JSON
     - `F5` -> Atualizar dados
     - `F11` -> Modo Ecrã Inteiro

2. **Painel Geral (Dashboard):**
   - 4 Cartões KPI com contagens em tempo real e valor financeiro global.
   - Gráficos de barras interativos com percentagens por estado operacional.
   - Distribuição de investimentos e volume por marca.
   - Categorias com filtros imediatos.

3. **Tabela de Equipamentos:**
   - Pesquisa instantânea em tempo real (filtra por património, série, modelo, marca, utilizador e local).
   - Filtros encadeados (selecionar uma marca filtra dinamicamente os modelos disponíveis dessa marca).
   - Paginação selecionável (10, 25, 50, 100 ou ver todos os 200 de uma vez).
   - Ordenação clicável por qualquer cabeçalho de coluna.
   - Alteração rápida de estado clicando na etiqueta colorida.
   - Ficha técnica detalhada com simulação de código de barras SVG e botão de impressão de etiquetas.

4. **Gestão de Modelos e Marcas:**
   - Adicionar, editar e eliminar com proteção de integridade referencial.

5. **Salvaguarda & Restauro:**
   - Função no menu nativo e na interface para **Restaurar os 200 Equipamentos Iniciais de Fábrica** a qualquer momento.
