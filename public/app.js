(function () {
  'use strict';

  // ==========================================================
  // ESTADO GLOBAL DA APLICAÇÃO
  // ==========================================================
  const state = {
    currentTab: 'dashboard', // 'dashboard', 'equipments', 'models', 'brands', 'settings'
    brands: [],
    models: [],
    equipments: [],
    stats: null,
    loading: false,

    // Filtros de Equipamentos
    equipmentFilters: {
      search: '',
      brandId: 'all',
      modelId: 'all',
      category: 'all',
      status: 'all',
      sortBy: 'assetTag',
      sortOrder: 'asc',
      page: 1,
      pageSize: 25
    },

    // Filtros de Modelos
    modelFilters: {
      search: '',
      brandId: 'all',
      category: 'all'
    },

    // Filtros de Marcas
    brandFilters: {
      search: ''
    }
  };

  const API_BASE = '/api';

  // ==========================================================
  // COMUNICAÇÃO COM O SERVIDOR (COM FALLBACK LOCAL SE OFFLINE)
  // ==========================================================
  async function apiFetch(endpoint, options = {}) {
    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        headers: { 'Content-Type': 'application/json' },
        ...options
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `Erro HTTP ${res.status}`);
      }
      return await res.json();
    } catch (err) {
      console.warn(`API ${endpoint} falhou:`, err.message);
      throw err;
    }
  }

  async function loadAllData() {
    state.loading = true;
    render();

    try {
      const res = await apiFetch('/database');
      if (res && res.data) {
        state.brands = res.data.brands || [];
        state.models = res.data.models || [];
        state.equipments = res.data.equipments || [];
      }
    } catch (err) {
      // Se a API não responder (por exemplo, se aberto direto via file://), tenta do localStorage ou seed
      console.log('Modo de contingência / offline ativado.');
      let loaded = false;
      const localData = localStorage.getItem('gestor_inventario_db');
      if (localData) {
        try {
          const parsed = JSON.parse(localData);
          if (parsed.brands && parsed.equipments && parsed.equipments.length > 0) {
            state.brands = parsed.brands || [];
            state.models = parsed.models || [];
            state.equipments = parsed.equipments || [];
            loaded = true;
          }
        } catch (e) {
          console.error('Erro ao ler localStorage', e);
        }
      }

      if (!loaded && window.INITIAL_DATABASE) {
        state.brands = window.INITIAL_DATABASE.brands || [];
        state.models = window.INITIAL_DATABASE.models || [];
        state.equipments = window.INITIAL_DATABASE.equipments || [];
        syncLocalBackup();
      }
    }

    state.loading = false;
    render();
    if (typeof window.dismissSplashScreen === 'function') {
      window.dismissSplashScreen();
    }
  }

  function syncLocalBackup() {
    try {
      localStorage.setItem('gestor_inventario_db', JSON.stringify({
        brands: state.brands,
        models: state.models,
        equipments: state.equipments
      }));
    } catch (e) {
      // ignore
    }
  }

  // ==========================================================
  // NOTIFICAÇÕES TOAST
  // ==========================================================
  function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let icon = '';

    toast.innerHTML = `<span>${escapeHtml(message)}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function formatCurrency(val) {
    const num = Number(val) || 0;
    return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(num);
  }

  function formatDate(dStr) {
    if (!dStr) return '-';
    try {
      const d = new Date(dStr);
      return d.toLocaleDateString('pt-PT');
    } catch {
      return dStr;
    }
  }

  // ==========================================================
  // GESTÃO DE MODAIS
  // ==========================================================
  function openModal(contentHtml) {
    const container = document.getElementById('modal-container');
    const content = document.getElementById('modal-content');
    if (!container || !content) return;

    content.innerHTML = contentHtml;
    container.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    // Fecha ao clicar fora
    container.onclick = (e) => {
      if (e.target === container) closeModal();
    };
  }

  function closeModal() {
    const container = document.getElementById('modal-container');
    if (!container) return;
    container.classList.add('hidden');
    document.body.style.overflow = '';
  }

  window.closeModal = closeModal;

  // ==========================================================
  // NAVEGAÇÃO E ABAS
  // ==========================================================
  function setTab(tabName) {
    state.currentTab = tabName;
    render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ==========================================================
  // RENDERIZAÇÃO PRINCIPAL
  // ==========================================================
  function render() {
    const app = document.getElementById('app');
    if (!app) return;

    const totalEq = state.equipments.length;
    const totalMod = state.models.length;
    const totalBra = state.brands.length;

    let contentHtml = '';

    if (state.currentTab === 'dashboard') {
      contentHtml = renderDashboardView();
    } else if (state.currentTab === 'equipments') {
      contentHtml = renderEquipmentsView();
    } else if (state.currentTab === 'models') {
      contentHtml = renderModelsView();
    } else if (state.currentTab === 'brands') {
      contentHtml = renderBrandsView();
    } else if (state.currentTab === 'settings') {
      contentHtml = renderSettingsView();
    }

    app.innerHTML = `
      <!-- Cabeçalho Principal -->
      <header class="top-navbar">
        <div class="top-navbar-content">
          <div class="brand-title">
            <div class="brand-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg></div>
            <div class="brand-text">
              <h1>Gestor de Inventário TI</h1>
              <p>5 Marcas • 50 Modelos • ${totalEq} Equipamentos Registados</p>
            </div>
          </div>

          <nav class="nav-tabs">
            <button class="nav-tab-btn ${state.currentTab === 'dashboard' ? 'active' : ''}" onclick="window.setTab('dashboard')">
              Painel
            </button>
            <button class="nav-tab-btn ${state.currentTab === 'equipments' ? 'active' : ''}" onclick="window.setTab('equipments')">
              Equipamentos <span class="badge-pill">${totalEq}</span>
            </button>
            <button class="nav-tab-btn ${state.currentTab === 'models' ? 'active' : ''}" onclick="window.setTab('models')">
              Modelos <span class="badge-pill">${totalMod}</span>
            </button>
            <button class="nav-tab-btn ${state.currentTab === 'brands' ? 'active' : ''}" onclick="window.setTab('brands')">
              Marcas <span class="badge-pill">${totalBra}</span>
            </button>
            <button class="nav-tab-btn ${state.currentTab === 'settings' ? 'active' : ''}" onclick="window.setTab('settings')">
              Dados & Sistema
            </button>
          </nav>
        </div>
      </header>

      <!-- Conteúdo da Aba Ativa -->
      <main class="main-wrapper">
        ${contentHtml}
      </main>
    `;

    bindTabEvents();
  }

  // ==========================================================
  // ABA: DASHBOARD / PAINEL GERAL
  // ==========================================================
  function renderDashboardView() {
    const totalEq = state.equipments.length;
    const totalMod = state.models.length;
    const totalBra = state.brands.length;

    const totalValue = state.equipments.reduce((sum, e) => sum + (Number(e.value) || 0), 0);

    // Contagens de status
    const statusCounts = {
      'Em Uso': 0,
      'Disponível': 0,
      'Em Manutenção': 0,
      'Em Reserva': 0
    };

    state.equipments.forEach(e => {
      const st = e.status || 'Disponível';
      statusCounts[st] = (statusCounts[st] || 0) + 1;
    });

    // Agrupamento por Marca
    const brandStats = state.brands.map(b => {
      const eqCount = state.equipments.filter(e => e.brandId === b.id).length;
      const modCount = state.models.filter(m => m.brandId === b.id).length;
      const val = state.equipments
        .filter(e => e.brandId === b.id)
        .reduce((sum, e) => sum + (Number(e.value) || 0), 0);
      return {
        ...b,
        eqCount,
        modCount,
        val
      };
    });

    // Categorias
    const catCounts = {};
    state.equipments.forEach(e => {
      const c = e.category || 'Geral';
      catCounts[c] = (catCounts[c] || 0) + 1;
    });

    return `
      <!-- KPIs -->
      <div class="kpi-grid">
        <div class="kpi-card" onclick="window.setTab('equipments')" style="cursor: pointer;">
          <div class="kpi-info">
            <h3>Equipamentos</h3>
            <div class="kpi-value">${totalEq}</div>
            <div class="kpi-sub">${statusCounts['Em Uso']} em uso • ${statusCounts['Disponível']} disponíveis</div>
          </div>
          <div class="kpi-icon-wrap kpi-blue"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg></div>
        </div>

        <div class="kpi-card" onclick="window.setTab('models')" style="cursor: pointer;">
          <div class="kpi-info">
            <h3>Modelos TI</h3>
            <div class="kpi-value">${totalMod}</div>
            <div class="kpi-sub">10 modelos por cada marca</div>
          </div>
          <div class="kpi-icon-wrap kpi-indigo"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg></div>
        </div>

        <div class="kpi-card" onclick="window.setTab('brands')" style="cursor: pointer;">
          <div class="kpi-info">
            <h3>Marcas</h3>
            <div class="kpi-value">${totalBra}</div>
            <div class="kpi-sub">Dell, Apple, HP, Lenovo, Cisco</div>
          </div>
          <div class="kpi-icon-wrap kpi-emerald"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg></div>
        </div>

        <div class="kpi-card">
          <div class="kpi-info">
            <h3>Valor Patrimonial</h3>
            <div class="kpi-value" style="font-size: 24px;">${formatCurrency(totalValue)}</div>
            <div class="kpi-sub">Média de ${formatCurrency(totalEq ? totalValue / totalEq : 0)} / unid.</div>
          </div>
          <div class="kpi-icon-wrap kpi-purple"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M14.5 9a3.5 3.5 0 0 0-5 0v6a3.5 3.5 0 0 0 5 0"/><line x1="7" y1="10.5" x2="13" y2="10.5"/><line x1="7" y1="13.5" x2="13" y2="13.5"/></svg></div>
        </div>
      </div>

      <!-- Linha de Gráficos e Distribuição -->
      <div class="dashboard-row">
        <!-- Distribuição por Estado -->
        <div class="content-card">
          <div class="card-header-flex">
            <div>
              <h2 class="card-title">Estado do Parque Informático</h2>
              <p class="card-subtitle">Condição operacional dos ${totalEq} equipamentos</p>
            </div>
            <button class="btn btn-secondary btn-sm" onclick="window.setTab('equipments')">Ver Tabela</button>
          </div>

          <div class="status-pill-list">
            <!-- Em Uso -->
            <div class="status-bar-item">
              <div class="status-bar-header">
                <span class="status-badge status-em-uso">Em Uso</span>
                <span><strong>${statusCounts['Em Uso']}</strong> (${totalEq ? Math.round((statusCounts['Em Uso']/totalEq)*100) : 0}%)</span>
              </div>
              <div class="progress-track">
                <div class="progress-fill bg-in-use" style="width: ${totalEq ? (statusCounts['Em Uso']/totalEq)*100 : 0}%;"></div>
              </div>
            </div>

            <!-- Disponível -->
            <div class="status-bar-item">
              <div class="status-bar-header">
                <span class="status-badge status-disponivel">Disponível em Stock</span>
                <span><strong>${statusCounts['Disponível']}</strong> (${totalEq ? Math.round((statusCounts['Disponível']/totalEq)*100) : 0}%)</span>
              </div>
              <div class="progress-track">
                <div class="progress-fill bg-available" style="width: ${totalEq ? (statusCounts['Disponível']/totalEq)*100 : 0}%;"></div>
              </div>
            </div>

            <!-- Em Manutenção -->
            <div class="status-bar-item">
              <div class="status-bar-header">
                <span class="status-badge status-em-manutencao">Em Manutenção</span>
                <span><strong>${statusCounts['Em Manutenção']}</strong> (${totalEq ? Math.round((statusCounts['Em Manutenção']/totalEq)*100) : 0}%)</span>
              </div>
              <div class="progress-track">
                <div class="progress-fill bg-maintenance" style="width: ${totalEq ? (statusCounts['Em Manutenção']/totalEq)*100 : 0}%;"></div>
              </div>
            </div>

            <!-- Em Reserva -->
            <div class="status-bar-item">
              <div class="status-bar-header">
                <span class="status-badge status-em-reserva">Em Reserva (Hot-Spare)</span>
                <span><strong>${statusCounts['Em Reserva']}</strong> (${totalEq ? Math.round((statusCounts['Em Reserva']/totalEq)*100) : 0}%)</span>
              </div>
              <div class="progress-track">
                <div class="progress-fill bg-spare" style="width: ${totalEq ? (statusCounts['Em Reserva']/totalEq)*100 : 0}%;"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Distribuição por Marca -->
        <div class="content-card">
          <div class="card-header-flex">
            <div>
              <h2 class="card-title">Equipamentos por Marca</h2>
              <p class="card-subtitle">Volume e valor investido por fabricante</p>
            </div>
            <button class="btn btn-secondary btn-sm" onclick="window.setTab('brands')">Ver Marcas</button>
          </div>

          <div class="brand-breakdown-list">
            ${brandStats.map(b => {
              const codeClass = b.code ? b.code.toLowerCase() : 'dell';
              return `
                <div class="brand-stat-item" onclick="window.filterByBrand('${b.id}')" style="cursor: pointer;">
                  <div class="brand-stat-meta">
                    <div class="brand-avatar ${codeClass}">${escapeHtml(b.code || b.name.slice(0, 3))}</div>
                    <div>
                      <strong style="font-size: 14px; color: var(--dark-900);">${escapeHtml(b.name)}</strong>
                      <div style="font-size: 12px; color: var(--slate-500);">${b.modCount} modelos disponíveis</div>
                    </div>
                  </div>
                  <div class="brand-stat-counts">
                    <strong>${b.eqCount} unid.</strong>
                    <div style="color: var(--primary); font-weight: 600;">${formatCurrency(b.val)}</div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>

      <!-- Linha com Categorias e Ações Rápidas -->
      <div class="dashboard-row">
        <!-- Categorias de Equipamentos -->
        <div class="content-card">
          <h2 class="card-title" style="margin-bottom: 16px;">Categorias Principais</h2>
          <div style="display: flex; flex-wrap: wrap; gap: 10px;">
            ${Object.entries(catCounts).map(([cat, count]) => `
              <div style="background: var(--slate-50); border: 1px solid var(--slate-200); padding: 8px 14px; border-radius: var(--radius-md); display: flex; align-items: center; gap: 8px;">
                <span style="font-weight: 600; font-size: 13px;">${escapeHtml(cat)}</span>
                <span style="background: var(--primary-light); color: var(--primary); padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 700;">${count}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Ações Rápidas -->
        <div class="content-card" style="display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <h2 class="card-title" style="margin-bottom: 12px;">Ações Rápidas</h2>
            <p class="card-subtitle" style="margin-bottom: 18px;">Operações frequentes de catalogação e auditoria patrimonial.</p>
          </div>
          
          <div style="display: flex; flex-wrap: wrap; gap: 10px;">
            <button class="btn btn-primary" onclick="window.openNewEquipmentModal()">
              + Novo Equipamento
            </button>
            <button class="btn btn-secondary" onclick="window.openNewModelModal()">
              + Novo Modelo
            </button>
            <button class="btn btn-secondary" onclick="window.openNewBrandModal()">
              + Nova Marca
            </button>
            <button class="btn btn-secondary" onclick="window.exportCSV()">
              Exportar Inventário (CSV)
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // ==========================================================
  // ABA: EQUIPAMENTOS (TABELA COM 200 ITENS + FILTROS)
  // ==========================================================
  function renderEquipmentsView() {
    const f = state.equipmentFilters;

    // Filtragem em memória
    let items = [...state.equipments];

    if (f.search) {
      const s = f.search.toLowerCase().trim();
      items = items.filter(e =>
        (e.assetTag && e.assetTag.toLowerCase().includes(s)) ||
        (e.serialNumber && e.serialNumber.toLowerCase().includes(s)) ||
        (e.modelName && e.modelName.toLowerCase().includes(s)) ||
        (e.brandName && e.brandName.toLowerCase().includes(s)) ||
        (e.assignedTo && e.assignedTo.toLowerCase().includes(s)) ||
        (e.location && e.location.toLowerCase().includes(s)) ||
        (e.category && e.category.toLowerCase().includes(s))
      );
    }

    if (f.brandId !== 'all') {
      items = items.filter(e => e.brandId === f.brandId);
    }

    if (f.modelId !== 'all') {
      items = items.filter(e => e.modelId === f.modelId);
    }

    if (f.category !== 'all') {
      items = items.filter(e => e.category === f.category);
    }

    if (f.status !== 'all') {
      items = items.filter(e => e.status === f.status);
    }

    // Ordenação
    items.sort((a, b) => {
      let valA = a[f.sortBy];
      let valB = b[f.sortBy];
      const mult = f.sortOrder === 'desc' ? -1 : 1;

      if (f.sortBy === 'value') {
        return (Number(valA || 0) - Number(valB || 0)) * mult;
      }
      return String(valA || '').localeCompare(String(valB || ''), 'pt', { sensitivity: 'base' }) * mult;
    });

    // Paginação
    const totalFiltered = items.length;
    let paginated = items;
    let totalPages = 1;

    if (f.pageSize !== 'all') {
      const size = parseInt(f.pageSize, 10);
      totalPages = Math.ceil(totalFiltered / size) || 1;
      if (f.page > totalPages) f.page = totalPages;
      const start = (f.page - 1) * size;
      paginated = items.slice(start, start + size);
    }

    // Categorias únicas para filtro
    const uniqueCategories = Array.from(new Set(state.models.map(m => m.category))).sort();

    // Modelos para o dropdown (se marca selecionada, filtra modelos)
    let availableModels = state.models;
    if (f.brandId !== 'all') {
      availableModels = availableModels.filter(m => m.brandId === f.brandId);
    }

    return `
      <div class="content-card" style="padding-bottom: 0;">
        <div class="card-header-flex">
          <div>
            <h2 class="card-title">Equipamentos Registados (${totalFiltered} de ${state.equipments.length})</h2>
            <p class="card-subtitle">Registo detalhado com n.º de série, património, marca, modelo e localização.</p>
          </div>

          <div class="toolbar-buttons">
            <button class="btn btn-primary" onclick="window.openNewEquipmentModal()">
              + Novo Equipamento
            </button>
            <button class="btn btn-secondary btn-sm" onclick="window.exportCSV()">
              Exportar CSV
            </button>
            <button class="btn btn-secondary btn-sm" onclick="window.exportJSON()">
              Exportar JSON
            </button>
          </div>
        </div>

        <!-- Barra de Ferramentas / Pesquisa e Filtros -->
        <div class="toolbar-wrap">
          <div class="search-input-box">
            <span class="search-icon-inside"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></span>
            <input
              type="text"
              id="equipment-search-input"
              placeholder="Pesquisar por N.º Série, Património, Modelo, Colaborador..."
              value="${escapeHtml(f.search)}"
              oninput="window.handleEquipmentSearch(this.value)"
            >
          </div>

          <div class="filters-row">
            <!-- Filtro Marca -->
            <select class="select-filter" onchange="window.handleEquipmentBrandFilter(this.value)">
              <option value="all">Todas as Marcas (${state.brands.length})</option>
              ${state.brands.map(b => `
                <option value="${b.id}" ${f.brandId === b.id ? 'selected' : ''}>${escapeHtml(b.name)}</option>
              `).join('')}
            </select>

            <!-- Filtro Modelo -->
            <select class="select-filter" onchange="window.handleEquipmentModelFilter(this.value)">
              <option value="all">Todos os Modelos (${availableModels.length})</option>
              ${availableModels.map(m => `
                <option value="${m.id}" ${f.modelId === m.id ? 'selected' : ''}>${escapeHtml(m.name)}</option>
              `).join('')}
            </select>

            <!-- Filtro Estado -->
            <select class="select-filter" onchange="window.handleEquipmentStatusFilter(this.value)">
              <option value="all" ${f.status === 'all' ? 'selected' : ''}>Todos os Estados</option>
              <option value="Em Uso" ${f.status === 'Em Uso' ? 'selected' : ''}>Em Uso</option>
              <option value="Disponível" ${f.status === 'Disponível' ? 'selected' : ''}>Disponível</option>
              <option value="Em Manutenção" ${f.status === 'Em Manutenção' ? 'selected' : ''}>Em Manutenção</option>
              <option value="Em Reserva" ${f.status === 'Em Reserva' ? 'selected' : ''}>Em Reserva</option>
            </select>

            <!-- Filtro Categoria -->
            <select class="select-filter" onchange="window.handleEquipmentCategoryFilter(this.value)">
              <option value="all">Todas as Categorias</option>
              ${uniqueCategories.map(c => `
                <option value="${c}" ${f.category === c ? 'selected' : ''}>${escapeHtml(c)}</option>
              `).join('')}
            </select>

            ${(f.search || f.brandId !== 'all' || f.modelId !== 'all' || f.category !== 'all' || f.status !== 'all') ? `
              <button class="btn btn-secondary btn-sm" onclick="window.clearEquipmentFilters()">Limpar Filtros</button>
            ` : ''}
          </div>
        </div>

        <!-- Tabela de Equipamentos -->
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th class="sortable" onclick="window.handleSortEquipments('assetTag')">
                  Património ${f.sortBy === 'assetTag' ? (f.sortOrder === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th class="sortable" onclick="window.handleSortEquipments('serialNumber')">
                  N.º de Série ${f.sortBy === 'serialNumber' ? (f.sortOrder === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th class="sortable" onclick="window.handleSortEquipments('modelName')">
                  Modelo ${f.sortBy === 'modelName' ? (f.sortOrder === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th class="sortable" onclick="window.handleSortEquipments('brandName')">
                  Marca ${f.sortBy === 'brandName' ? (f.sortOrder === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th>Estado</th>
                <th class="sortable" onclick="window.handleSortEquipments('assignedTo')">
                  Atribuído a ${f.sortBy === 'assignedTo' ? (f.sortOrder === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th>Localização</th>
                <th class="sortable" onclick="window.handleSortEquipments('value')">
                  Valor € ${f.sortBy === 'value' ? (f.sortOrder === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th style="text-align: right;">Ações</th>
              </tr>
            </thead>
            <tbody>
              ${paginated.length === 0 ? `
                <tr>
                  <td colspan="9">
                    <div class="empty-state">
                      <div class="empty-state-icon" style="font-size: 20px; font-weight: bold; color: var(--slate-400);">Sem Registos</div>
                      <h4>Nenhum equipamento encontrado</h4>
                      <p>Tente ajustar os termos de pesquisa ou filtros selecionados.</p>
                    </div>
                  </td>
                </tr>
              ` : paginated.map(e => {
                const statusClass = e.status === 'Em Uso' ? 'status-em-uso' :
                                    e.status === 'Disponível' ? 'status-disponivel' :
                                    e.status === 'Em Manutenção' ? 'status-em-manutencao' : 'status-em-reserva';
                return `
                  <tr>
                    <td>
                      <span class="tag-badge">${escapeHtml(e.assetTag)}</span>
                    </td>
                    <td>
                      <span class="sn-badge">${escapeHtml(e.serialNumber)}</span>
                    </td>
                    <td>
                      <strong style="color: var(--dark-900); font-size: 13px;">${escapeHtml(e.modelName)}</strong>
                      <div style="font-size: 11px; color: var(--slate-500);">${escapeHtml(e.category || '')}</div>
                    </td>
                    <td>
                      <span style="font-weight: 600; font-size: 12px; color: var(--slate-700);">${escapeHtml(e.brandName)}</span>
                    </td>
                    <td>
                      <span class="status-badge ${statusClass}" style="cursor: pointer;" title="Clique para mudar estado" onclick="window.openQuickStatusModal('${e.id}')">
                        ${escapeHtml(e.status)}
                      </span>
                    </td>
                    <td>
                      <span style="font-size: 12px; color: var(--dark-800);">${escapeHtml(e.assignedTo || 'Não atribuído')}</span>
                    </td>
                    <td>
                      <span style="font-size: 12px; color: var(--slate-600);">${escapeHtml(e.location || '-')}</span>
                    </td>
                    <td>
                      <span style="font-weight: 600; font-size: 12px;">${formatCurrency(e.value)}</span>
                    </td>
                    <td style="text-align: right;">
                      <div class="table-actions" style="justify-content: flex-end;">
                        <button class="btn btn-secondary btn-sm" title="Ver Ficha Técnica" onclick="window.viewEquipmentDetail('${e.id}')">Ver</button>
                        <button class="btn btn-secondary btn-sm" title="Editar Equipamento" onclick="window.openEditEquipmentModal('${e.id}')">Editar</button>
                        <button class="btn btn-danger-outline btn-sm" title="Eliminar Equipamento" onclick="window.deleteEquipmentPrompt('${e.id}')">Eliminar</button>
                      </div>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>

        <!-- Barra de Paginação -->
        <div class="pagination-bar">
          <div>
            Mostrando <strong>${paginated.length}</strong> de <strong>${totalFiltered}</strong> equipamentos
          </div>

          <div style="display: flex; align-items: center; gap: 14px;">
            <div style="display: flex; align-items: center; gap: 6px;">
              <span>Itens por página:</span>
              <select class="select-filter" style="padding: 4px 8px; font-size: 12px;" onchange="window.handlePageSizeChange(this.value)">
                <option value="10" ${f.pageSize === 10 ? 'selected' : ''}>10</option>
                <option value="25" ${f.pageSize === 25 ? 'selected' : ''}>25</option>
                <option value="50" ${f.pageSize === 50 ? 'selected' : ''}>50</option>
                <option value="100" ${f.pageSize === 100 ? 'selected' : ''}>100</option>
                <option value="all" ${f.pageSize === 'all' ? 'selected' : ''}>Todos (200)</option>
              </select>
            </div>

            ${f.pageSize !== 'all' ? `
              <div class="pagination-controls">
                <button class="btn btn-secondary btn-sm" ${f.page <= 1 ? 'disabled' : ''} onclick="window.changePage(${f.page - 1})">◀ Anterior</button>
                <span style="font-weight: 600; padding: 0 4px;">Pág. ${f.page} de ${totalPages}</span>
                <button class="btn btn-secondary btn-sm" ${f.page >= totalPages ? 'disabled' : ''} onclick="window.changePage(${f.page + 1})">Seguinte ▶</button>
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }

  // ==========================================================
  // ABA: MODELOS (50 MODELOS)
  // ==========================================================
  function renderModelsView() {
    const f = state.modelFilters;

    let items = [...state.models];

    if (f.search) {
      const s = f.search.toLowerCase().trim();
      items = items.filter(m =>
        m.name.toLowerCase().includes(s) ||
        m.brandName.toLowerCase().includes(s) ||
        (m.specs && m.specs.toLowerCase().includes(s)) ||
        (m.category && m.category.toLowerCase().includes(s))
      );
    }

    if (f.brandId !== 'all') {
      items = items.filter(m => m.brandId === f.brandId);
    }

    return `
      <div class="content-card">
        <div class="card-header-flex">
          <div>
            <h2 class="card-title">Catálogo de Modelos (${items.length} de ${state.models.length})</h2>
            <p class="card-subtitle">50 Modelos no total registados no sistema distribuídos pelas 5 marcas principais.</p>
          </div>

          <button class="btn btn-primary" onclick="window.openNewModelModal()">
            + Novo Modelo
          </button>
        </div>

        <!-- Filtros de Modelos -->
        <div class="toolbar-wrap">
          <div class="search-input-box">
            <span class="search-icon-inside"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></span>
            <input
              type="text"
              placeholder="Pesquisar modelos por nome, processador, especificações..."
              value="${escapeHtml(f.search)}"
              oninput="window.handleModelSearch(this.value)"
            >
          </div>

          <div class="filters-row">
            <select class="select-filter" onchange="window.handleModelBrandFilter(this.value)">
              <option value="all">Todas as Marcas (${state.brands.length})</option>
              ${state.brands.map(b => `
                <option value="${b.id}" ${f.brandId === b.id ? 'selected' : ''}>${escapeHtml(b.name)}</option>
              `).join('')}
            </select>

            ${(f.search || f.brandId !== 'all') ? `
              <button class="btn btn-secondary btn-sm" onclick="window.clearModelFilters()">Limpar Filtros</button>
            ` : ''}
          </div>
        </div>

        <!-- Grid de Modelos -->
        <div class="models-grid">
          ${items.map(m => {
            const countUnits = state.equipments.filter(e => e.modelId === m.id).length;
            const inUseCount = state.equipments.filter(e => e.modelId === m.id && e.status === 'Em Uso').length;
            const availableCount = state.equipments.filter(e => e.modelId === m.id && e.status === 'Disponível').length;

            return `
              <div class="model-card">
                <div>
                  <div class="model-card-top">
                    <div>
                      <h3 class="model-card-title">${escapeHtml(m.name)}</h3>
                      <div style="font-size: 11px; color: var(--slate-500); margin-top: 2px;">${escapeHtml(m.type || m.category)}</div>
                    </div>
                    <span class="model-brand-pill">${escapeHtml(m.brandName)}</span>
                  </div>

                  <div class="model-specs">
                    ${escapeHtml(m.specs || 'Sem especificações')}
                  </div>
                </div>

                <div class="model-card-footer">
                  <div>
                    <div style="font-weight: 700; color: var(--dark-900);">${countUnits} unidades</div>
                    <div style="color: var(--slate-500); font-size: 11px;">${inUseCount} em uso • ${availableCount} stock</div>
                  </div>

                  <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="font-weight: 700; color: var(--primary);">${formatCurrency(m.basePrice)}</span>
                    <button class="btn btn-secondary btn-sm" title="Editar Modelo" onclick="window.openEditModelModal('${m.id}')">Editar</button>
                    <button class="btn btn-danger-outline btn-sm" title="Eliminar Modelo" onclick="window.deleteModelPrompt('${m.id}')">Eliminar</button>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  // ==========================================================
  // ABA: MARCAS (5 MARCAS)
  // ==========================================================
  function renderBrandsView() {
    return `
      <div class="content-card">
        <div class="card-header-flex">
          <div>
            <h2 class="card-title">Marcas Oficiais do Inventário (${state.brands.length})</h2>
            <p class="card-subtitle">Fabricantes globais homologados e integrados com os seus respetivos modelos e equipamentos.</p>
          </div>

          <button class="btn btn-primary" onclick="window.openNewBrandModal()">
            + Nova Marca
          </button>
        </div>

        <div class="brands-grid">
          ${state.brands.map(b => {
            const modelsOfBrand = state.models.filter(m => m.brandId === b.id);
            const equipmentsOfBrand = state.equipments.filter(e => e.brandId === b.id);
            const totalValue = equipmentsOfBrand.reduce((sum, e) => sum + (Number(e.value) || 0), 0);
            const codeClass = b.code ? b.code.toLowerCase() : 'dell';

            return `
              <div class="brand-card">
                <div class="brand-card-header">
                  <div class="brand-card-meta">
                    <div class="brand-card-avatar ${codeClass}">${escapeHtml(b.code || b.name.slice(0, 3))}</div>
                    <div class="brand-card-title">
                      <h3>${escapeHtml(b.name)}</h3>
                      <p>${escapeHtml(b.country || 'Internacional')} • ${escapeHtml(b.category || 'TI')}</p>
                    </div>
                  </div>

                  <div style="display: flex; gap: 6px;">
                    <button class="btn btn-secondary btn-sm" title="Editar Marca" onclick="window.openEditBrandModal('${b.id}')">Editar</button>
                    <button class="btn btn-danger-outline btn-sm" title="Eliminar Marca" onclick="window.deleteBrandPrompt('${b.id}')">Eliminar</button>
                  </div>
                </div>

                <div class="brand-desc">
                  ${escapeHtml(b.description || 'Fabricante parceiro oficial.')}
                </div>

                <div class="brand-kpi-row">
                  <div class="brand-kpi-box">
                    <span>Modelos</span>
                    <strong>${modelsOfBrand.length}</strong>
                  </div>
                  <div class="brand-kpi-box">
                    <span>Equipamentos</span>
                    <strong>${equipmentsOfBrand.length}</strong>
                  </div>
                  <div class="brand-kpi-box">
                    <span>Valor Ativos</span>
                    <strong style="color: var(--primary); font-size: 14px;">${formatCurrency(totalValue)}</strong>
                  </div>
                </div>

                <div style="display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: var(--slate-500); border-top: 1px solid var(--slate-100); padding-top: 12px;">
                  <div>
                    ${b.website ? `<a href="${escapeHtml(b.website)}" target="_blank" style="color: var(--primary); text-decoration: none; font-weight: 500;">Website Oficial &rarr;</a>` : ''}
                  </div>
                  <button class="btn btn-secondary btn-sm" onclick="window.filterByBrand('${b.id}')">
                    Ver ${equipmentsOfBrand.length} Equipamentos &rarr;
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  // ==========================================================
  // ABA: DEFINIÇÕES & GESTÃO DE DADOS
  // ==========================================================
  function renderSettingsView() {
    return `
      <div class="content-card">
        <h2 class="card-title" style="margin-bottom: 8px;">Gestão de Dados e Cópia de Segurança</h2>
        <p class="card-subtitle" style="margin-bottom: 24px;">Operações de restauro, exportação e importação de ficheiros JSON.</p>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 20px;">
          <!-- Restauro de Fábrica (200 Equipamentos) -->
          <div style="background: var(--slate-50); border: 1px solid var(--slate-200); border-radius: var(--radius-md); padding: 20px;">
            <h3 style="font-size: 16px; font-weight: 700; margin-bottom: 6px;">Restaurar Inventário Original</h3>
            <p style="font-size: 13px; color: var(--slate-600); margin-bottom: 16px;">
              Repõe o inventário exatamente para os <strong>200 equipamentos</strong> de fábrica (5 Marcas e 50 Modelos padronizados com números de série e património).
            </p>
            <button class="btn btn-danger-outline" onclick="window.resetDatabasePrompt()">
              Restaurar 200 Equipamentos Iniciais
            </button>
          </div>

          <!-- Exportar Backup -->
          <div style="background: var(--slate-50); border: 1px solid var(--slate-200); border-radius: var(--radius-md); padding: 20px;">
            <h3 style="font-size: 16px; font-weight: 700; margin-bottom: 6px;">Exportar Base de Dados</h3>
            <p style="font-size: 13px; color: var(--slate-600); margin-bottom: 16px;">
              Transfira um ficheiro JSON completo com todas as marcas, modelos e equipamentos atuais.
            </p>
            <button class="btn btn-secondary" onclick="window.exportJSON()">
              Descarregar Backup Completo (JSON)
            </button>
          </div>

          <!-- Importar Backup -->
          <div style="background: var(--slate-50); border: 1px solid var(--slate-200); border-radius: var(--radius-md); padding: 20px;">
            <h3 style="font-size: 16px; font-weight: 700; margin-bottom: 6px;">Importar Base de Dados</h3>
            <p style="font-size: 13px; color: var(--slate-600); margin-bottom: 16px;">
              Restaure ou carregue uma base de dados externa em formato JSON.
            </p>
            <input type="file" id="import-file-input" accept=".json" style="display: none;" onchange="window.handleImportFile(event)">
            <button class="btn btn-secondary" onclick="document.getElementById('import-file-input').click()">
              Selecionar Ficheiro JSON...
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // ==========================================================
  // EVENTOS E FILTROS DINÂMICOS
  // ==========================================================
  function bindTabEvents() {
    // Ligações automáticas
  }

  window.setTab = setTab;

  window.handleEquipmentSearch = (val) => {
    state.equipmentFilters.search = val;
    state.equipmentFilters.page = 1;
    render();
  };

  window.handleEquipmentBrandFilter = (brandId) => {
    state.equipmentFilters.brandId = brandId;
    state.equipmentFilters.modelId = 'all'; // reinicia modelo ao mudar marca
    state.equipmentFilters.page = 1;
    render();
  };

  window.handleEquipmentModelFilter = (modelId) => {
    state.equipmentFilters.modelId = modelId;
    state.equipmentFilters.page = 1;
    render();
  };

  window.handleEquipmentStatusFilter = (status) => {
    state.equipmentFilters.status = status;
    state.equipmentFilters.page = 1;
    render();
  };

  window.handleEquipmentCategoryFilter = (category) => {
    state.equipmentFilters.category = category;
    state.equipmentFilters.page = 1;
    render();
  };

  window.clearEquipmentFilters = () => {
    state.equipmentFilters.search = '';
    state.equipmentFilters.brandId = 'all';
    state.equipmentFilters.modelId = 'all';
    state.equipmentFilters.category = 'all';
    state.equipmentFilters.status = 'all';
    state.equipmentFilters.page = 1;
    render();
  };

  window.handleSortEquipments = (col) => {
    if (state.equipmentFilters.sortBy === col) {
      state.equipmentFilters.sortOrder = state.equipmentFilters.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      state.equipmentFilters.sortBy = col;
      state.equipmentFilters.sortOrder = 'asc';
    }
    render();
  };

  window.handlePageSizeChange = (val) => {
    state.equipmentFilters.pageSize = val === 'all' ? 'all' : parseInt(val, 10);
    state.equipmentFilters.page = 1;
    render();
  };

  window.changePage = (p) => {
    state.equipmentFilters.page = p;
    render();
  };

  window.filterByBrand = (brandId) => {
    state.equipmentFilters.brandId = brandId;
    state.equipmentFilters.modelId = 'all';
    state.equipmentFilters.page = 1;
    setTab('equipments');
  };

  window.handleModelSearch = (val) => {
    state.modelFilters.search = val;
    render();
  };

  window.handleModelBrandFilter = (brandId) => {
    state.modelFilters.brandId = brandId;
    render();
  };

  window.clearModelFilters = () => {
    state.modelFilters.search = '';
    state.modelFilters.brandId = 'all';
    render();
  };

  // ==========================================================
  // MODAL: NOVO / EDITAR EQUIPAMENTO
  // ==========================================================
  window.openNewEquipmentModal = () => {
    const defaultBrand = state.brands[0] ? state.brands[0].id : '';
    const filteredModels = state.models.filter(m => m.brandId === defaultBrand);
    const defaultModel = filteredModels[0] || state.models[0];

    // Sugere próximo número de património
    const maxNum = state.equipments.reduce((max, e) => {
      const m = e.assetTag && e.assetTag.match(/PAT-(\d+)/);
      return m ? Math.max(max, parseInt(m[1], 10)) : max;
    }, 0);
    const suggestedTag = `PAT-${String(maxNum + 1).padStart(4, '0')}`;

    // Sugere número de série
    const brandCode = state.brands[0] ? state.brands[0].code : 'IT';
    const rand = Math.floor(1000 + Math.random() * 9000);
    const suggestedSN = `SN-${brandCode}-${new Date().getFullYear().toString().slice(-2)}-${rand}`;

    const html = `
      <div class="modal-header">
        <h2>Registar Novo Equipamento</h2>
        <button class="btn-close-modal" onclick="window.closeModal()">&times;</button>
      </div>

      <form id="equipment-form" onsubmit="window.saveEquipmentForm(event, null)">
        <div class="form-grid">
          <!-- Marca -->
          <div class="form-group">
            <label class="form-label">Marca *</label>
            <select class="form-select" id="form-brand-select" onchange="window.updateModelOptionsInForm(this.value)" required>
              ${state.brands.map(b => `<option value="${b.id}">${escapeHtml(b.name)}</option>`).join('')}
            </select>
          </div>

          <!-- Modelo -->
          <div class="form-group">
            <label class="form-label">Modelo *</label>
            <select class="form-select" id="form-model-select" onchange="window.updateModelSpecsInForm(this.value)" required>
              ${filteredModels.map(m => `<option value="${m.id}">${escapeHtml(m.name)}</option>`).join('')}
            </select>
          </div>

          <!-- Património -->
          <div class="form-group">
            <label class="form-label">Etiqueta de Património *</label>
            <input type="text" class="form-input" id="form-asset-tag" value="${suggestedTag}" required>
          </div>

          <!-- Número de Série -->
          <div class="form-group">
            <label class="form-label">Número de Série *</label>
            <input type="text" class="form-input" id="form-serial-number" value="${suggestedSN}" required>
          </div>

          <!-- Estado -->
          <div class="form-group">
            <label class="form-label">Estado Operacional *</label>
            <select class="form-select" id="form-status" required>
              <option value="Disponível">Disponível em Stock</option>
              <option value="Em Uso">Em Uso</option>
              <option value="Em Manutenção">Em Manutenção</option>
              <option value="Em Reserva">Em Reserva</option>
            </select>
          </div>

          <!-- Valor de Aquisição -->
          <div class="form-group">
            <label class="form-label">Valor (€)</label>
            <input type="number" step="0.01" class="form-input" id="form-value" value="${defaultModel ? defaultModel.basePrice : 0}">
          </div>

          <!-- Atribuído a -->
          <div class="form-group">
            <label class="form-label">Atribuído a (Colaborador / Departamento)</label>
            <input type="text" class="form-input" id="form-assigned" placeholder="Ex: Diogo Costa (TI)">
          </div>

          <!-- Localização -->
          <div class="form-group">
            <label class="form-label">Localização Física</label>
            <input type="text" class="form-input" id="form-location" value="Armazém Central - Lisboa">
          </div>

          <!-- Data de Aquisição -->
          <div class="form-group">
            <label class="form-label">Data de Aquisição</label>
            <input type="date" class="form-input" id="form-date" value="${new Date().toISOString().split('T')[0]}">
          </div>

          <!-- Especificações do modelo (informativo) -->
          <div class="form-group form-full">
            <label class="form-label">Notas e Observações</label>
            <textarea class="form-textarea" id="form-notes" placeholder="Detalhes adicionais sobre o equipamento ou configuração especial..."></textarea>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" class="btn btn-secondary" onclick="window.closeModal()">Cancelar</button>
          <button type="submit" class="btn btn-primary">Gravar Equipamento</button>
        </div>
      </form>
    `;

    openModal(html);
  };

  window.openEditEquipmentModal = (id) => {
    const item = state.equipments.find(e => e.id === id);
    if (!item) return;

    const brandModels = state.models.filter(m => m.brandId === item.brandId);

    const html = `
      <div class="modal-header">
        <h2>Editar Equipamento: ${escapeHtml(item.assetTag)}</h2>
        <button class="btn-close-modal" onclick="window.closeModal()">&times;</button>
      </div>

      <form id="equipment-form" onsubmit="window.saveEquipmentForm(event, '${item.id}')">
        <div class="form-grid">
          <!-- Marca -->
          <div class="form-group">
            <label class="form-label">Marca *</label>
            <select class="form-select" id="form-brand-select" onchange="window.updateModelOptionsInForm(this.value)" required>
              ${state.brands.map(b => `<option value="${b.id}" ${b.id === item.brandId ? 'selected' : ''}>${escapeHtml(b.name)}</option>`).join('')}
            </select>
          </div>

          <!-- Modelo -->
          <div class="form-group">
            <label class="form-label">Modelo *</label>
            <select class="form-select" id="form-model-select" required>
              ${brandModels.map(m => `<option value="${m.id}" ${m.id === item.modelId ? 'selected' : ''}>${escapeHtml(m.name)}</option>`).join('')}
            </select>
          </div>

          <!-- Património -->
          <div class="form-group">
            <label class="form-label">Etiqueta de Património *</label>
            <input type="text" class="form-input" id="form-asset-tag" value="${escapeHtml(item.assetTag)}" required>
          </div>

          <!-- Número de Série -->
          <div class="form-group">
            <label class="form-label">Número de Série *</label>
            <input type="text" class="form-input" id="form-serial-number" value="${escapeHtml(item.serialNumber)}" required>
          </div>

          <!-- Estado -->
          <div class="form-group">
            <label class="form-label">Estado Operacional *</label>
            <select class="form-select" id="form-status" required>
              <option value="Em Uso" ${item.status === 'Em Uso' ? 'selected' : ''}>Em Uso</option>
              <option value="Disponível" ${item.status === 'Disponível' ? 'selected' : ''}>Disponível</option>
              <option value="Em Manutenção" ${item.status === 'Em Manutenção' ? 'selected' : ''}>Em Manutenção</option>
              <option value="Em Reserva" ${item.status === 'Em Reserva' ? 'selected' : ''}>Em Reserva</option>
            </select>
          </div>

          <!-- Valor -->
          <div class="form-group">
            <label class="form-label">Valor (€)</label>
            <input type="number" step="0.01" class="form-input" id="form-value" value="${item.value || 0}">
          </div>

          <!-- Atribuído a -->
          <div class="form-group">
            <label class="form-label">Atribuído a</label>
            <input type="text" class="form-input" id="form-assigned" value="${escapeHtml(item.assignedTo || '')}">
          </div>

          <!-- Localização -->
          <div class="form-group">
            <label class="form-label">Localização Física</label>
            <input type="text" class="form-input" id="form-location" value="${escapeHtml(item.location || '')}">
          </div>

          <!-- Data de Aquisição -->
          <div class="form-group">
            <label class="form-label">Data de Aquisição</label>
            <input type="date" class="form-input" id="form-date" value="${item.acquisitionDate || ''}">
          </div>

          <!-- Notas -->
          <div class="form-group form-full">
            <label class="form-label">Notas e Observações</label>
            <textarea class="form-textarea" id="form-notes">${escapeHtml(item.notes || '')}</textarea>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" class="btn btn-secondary" onclick="window.closeModal()">Cancelar</button>
          <button type="submit" class="btn btn-primary">Guardar Alterações</button>
        </div>
      </form>
    `;

    openModal(html);
  };

  window.updateModelOptionsInForm = (brandId) => {
    const modelSelect = document.getElementById('form-model-select');
    if (!modelSelect) return;

    const filtered = state.models.filter(m => m.brandId === brandId);
    modelSelect.innerHTML = filtered.map(m => `<option value="${m.id}">${escapeHtml(m.name)}</option>`).join('');

    if (filtered[0]) {
      window.updateModelSpecsInForm(filtered[0].id);
    }
  };

  window.updateModelSpecsInForm = (modelId) => {
    const model = state.models.find(m => m.id === modelId);
    const valInput = document.getElementById('form-value');
    if (model && valInput && !valInput.value) {
      valInput.value = model.basePrice;
    }
  };

  window.saveEquipmentForm = async (e, existingId) => {
    e.preventDefault();

    const modelId = document.getElementById('form-model-select').value;
    const model = state.models.find(m => m.id === modelId);
    if (!model) {
      alert('Selecione um modelo válido.');
      return;
    }

    const payload = {
      modelId: model.id,
      assetTag: document.getElementById('form-asset-tag').value.trim(),
      serialNumber: document.getElementById('form-serial-number').value.trim(),
      status: document.getElementById('form-status').value,
      value: parseFloat(document.getElementById('form-value').value) || 0,
      assignedTo: document.getElementById('form-assigned').value.trim(),
      location: document.getElementById('form-location').value.trim(),
      acquisitionDate: document.getElementById('form-date').value,
      notes: document.getElementById('form-notes').value.trim()
    };

    try {
      if (existingId) {
        await apiFetch(`/equipments/${existingId}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
        showToast('Equipamento atualizado com sucesso!', 'success');
      } else {
        await apiFetch('/equipments', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        showToast('Equipamento registado com sucesso!', 'success');
      }

      closeModal();
      await loadAllData();
      syncLocalBackup();
    } catch (err) {
      // Fallback local se estiver offline
      if (existingId) {
        const idx = state.equipments.findIndex(e => e.id === existingId);
        if (idx !== -1) {
          state.equipments[idx] = { ...state.equipments[idx], ...payload, modelName: model.name, brandId: model.brandId, brandName: model.brandName, category: model.category, specs: model.specs, updatedAt: new Date().toISOString() };
        }
        showToast('Equipamento atualizado (Modo Local)!', 'success');
      } else {
        const newEq = {
          id: `eq-${Date.now()}`,
          ...payload,
          brandId: model.brandId,
          brandName: model.brandName,
          modelName: model.name,
          category: model.category,
          specs: model.specs,
          updatedAt: new Date().toISOString()
        };
        state.equipments.unshift(newEq);
        showToast('Equipamento registado (Modo Local)!', 'success');
      }
      closeModal();
      syncLocalBackup();
      render();
    }
  };

  // ==========================================================
  // MODAL: FICHA TÉCNICA DO EQUIPAMENTO
  // ==========================================================
  window.viewEquipmentDetail = (id) => {
    const item = state.equipments.find(e => e.id === id);
    if (!item) return;

    const brand = state.brands.find(b => b.id === item.brandId);
    const model = state.models.find(m => m.id === item.modelId);

    const statusClass = item.status === 'Em Uso' ? 'status-em-uso' :
                        item.status === 'Disponível' ? 'status-disponivel' :
                        item.status === 'Em Manutenção' ? 'status-em-manutencao' : 'status-em-reserva';

    const html = `
      <div class="modal-header">
        <div>
          <h2>Ficha Técnica do Ativo</h2>
          <span style="font-size: 13px; color: var(--slate-500);">${escapeHtml(item.assetTag)} • ${escapeHtml(item.serialNumber)}</span>
        </div>
        <button class="btn-close-modal" onclick="window.closeModal()">&times;</button>
      </div>

      <div class="detail-grid">
        <div class="detail-item">
          <span>Património</span>
          <strong>${escapeHtml(item.assetTag)}</strong>
        </div>

        <div class="detail-item">
          <span>Número de Série</span>
          <strong>${escapeHtml(item.serialNumber)}</strong>
        </div>

        <div class="detail-item">
          <span>Marca</span>
          <strong>${escapeHtml(item.brandName)}</strong>
        </div>

        <div class="detail-item">
          <span>Modelo</span>
          <strong>${escapeHtml(item.modelName)}</strong>
        </div>

        <div class="detail-item">
          <span>Categoria</span>
          <strong>${escapeHtml(item.category)}</strong>
        </div>

        <div class="detail-item">
          <span>Estado Operacional</span>
          <div><span class="status-badge ${statusClass}">${escapeHtml(item.status)}</span></div>
        </div>

        <div class="detail-item">
          <span>Atribuído a</span>
          <strong>${escapeHtml(item.assignedTo || 'Não atribuído')}</strong>
        </div>

        <div class="detail-item">
          <span>Localização Física</span>
          <strong>${escapeHtml(item.location || 'Não especificada')}</strong>
        </div>

        <div class="detail-item">
          <span>Data de Registo</span>
          <strong>${formatDate(item.acquisitionDate)}</strong>
        </div>

        <div class="detail-item">
          <span>Valor de Aquisição</span>
          <strong style="color: var(--primary);">${formatCurrency(item.value)}</strong>
        </div>
      </div>

      <div class="detail-item" style="margin-bottom: 16px;">
        <span>Especificações Técnicas</span>
        <div style="font-size: 13px; line-height: 1.5; margin-top: 4px; color: var(--dark-800);">
          ${escapeHtml(item.specs || (model ? model.specs : 'Não detalhado'))}
        </div>
      </div>

      ${item.notes ? `
        <div class="detail-item" style="margin-bottom: 16px;">
          <span>Observações</span>
          <div style="font-size: 13px; margin-top: 4px; color: var(--dark-800);">${escapeHtml(item.notes)}</div>
        </div>
      ` : ''}

      <!-- Código de Barras / QR Code Simulado em SVG -->
      <div class="barcode-box">
        <svg width="220" height="48" viewBox="0 0 220 48" xmlns="http://www.w3.org/2000/svg">
          <rect x="0" y="0" width="4" height="40" fill="#0f172a" />
          <rect x="8" y="0" width="2" height="40" fill="#0f172a" />
          <rect x="14" y="0" width="6" height="40" fill="#0f172a" />
          <rect x="24" y="0" width="3" height="40" fill="#0f172a" />
          <rect x="30" y="0" width="8" height="40" fill="#0f172a" />
          <rect x="42" y="0" width="2" height="40" fill="#0f172a" />
          <rect x="48" y="0" width="5" height="40" fill="#0f172a" />
          <rect x="58" y="0" width="2" height="40" fill="#0f172a" />
          <rect x="64" y="0" width="7" height="40" fill="#0f172a" />
          <rect x="76" y="0" width="4" height="40" fill="#0f172a" />
          <rect x="84" y="0" width="2" height="40" fill="#0f172a" />
          <rect x="90" y="0" width="8" height="40" fill="#0f172a" />
          <rect x="102" y="0" width="3" height="40" fill="#0f172a" />
          <rect x="110" y="0" width="5" height="40" fill="#0f172a" />
          <rect x="120" y="0" width="2" height="40" fill="#0f172a" />
          <rect x="126" y="0" width="6" height="40" fill="#0f172a" />
          <rect x="136" y="0" width="4" height="40" fill="#0f172a" />
          <rect x="144" y="0" width="2" height="40" fill="#0f172a" />
          <rect x="150" y="0" width="7" height="40" fill="#0f172a" />
          <rect x="162" y="0" width="3" height="40" fill="#0f172a" />
          <rect x="170" y="0" width="5" height="40" fill="#0f172a" />
          <rect x="180" y="0" width="2" height="40" fill="#0f172a" />
          <rect x="186" y="0" width="8" height="40" fill="#0f172a" />
          <rect x="198" y="0" width="4" height="40" fill="#0f172a" />
          <rect x="206" y="0" width="2" height="40" fill="#0f172a" />
          <rect x="212" y="0" width="6" height="40" fill="#0f172a" />
        </svg>
        <div style="font-family: var(--font-mono); font-size: 11px; margin-top: 4px; color: var(--slate-600);">${escapeHtml(item.assetTag)} * ${escapeHtml(item.serialNumber)}</div>
      </div>

      <div class="form-actions">
        <button type="button" class="btn btn-secondary" onclick="window.print()">Imprimir Ficha</button>
        <button type="button" class="btn btn-secondary" onclick="window.openEditEquipmentModal('${item.id}')">Editar</button>
        <button type="button" class="btn btn-primary" onclick="window.closeModal()">Fechar</button>
      </div>
    `;

    openModal(html);
  };

  // ==========================================================
  // MODAL: ALTERAÇÃO RÁPIDA DE ESTADO
  // ==========================================================
  window.openQuickStatusModal = (id) => {
    const item = state.equipments.find(e => e.id === id);
    if (!item) return;

    const html = `
      <div class="modal-header">
        <h2>Alterar Estado do Equipamento</h2>
        <button class="btn-close-modal" onclick="window.closeModal()">&times;</button>
      </div>

      <p style="font-size: 13px; color: var(--slate-600); margin-bottom: 16px;">
        Selecione o novo estado para <strong>${escapeHtml(item.assetTag)} (${escapeHtml(item.modelName)})</strong>:
      </p>

      <form onsubmit="window.saveQuickStatus(event, '${item.id}')">
        <div class="form-group" style="margin-bottom: 16px;">
          <label class="form-label">Novo Estado</label>
          <select class="form-select" id="quick-status-select" required>
            <option value="Em Uso" ${item.status === 'Em Uso' ? 'selected' : ''}>Em Uso</option>
            <option value="Disponível" ${item.status === 'Disponível' ? 'selected' : ''}>Disponível em Stock</option>
            <option value="Em Manutenção" ${item.status === 'Em Manutenção' ? 'selected' : ''}>Em Manutenção Técnica</option>
            <option value="Em Reserva" ${item.status === 'Em Reserva' ? 'selected' : ''}>Em Reserva (Hot-Spare)</option>
          </select>
        </div>

        <div class="form-group" style="margin-bottom: 16px;">
          <label class="form-label">Atribuído a</label>
          <input type="text" class="form-input" id="quick-assigned" value="${escapeHtml(item.assignedTo || '')}">
        </div>

        <div class="form-group">
          <label class="form-label">Localização</label>
          <input type="text" class="form-input" id="quick-location" value="${escapeHtml(item.location || '')}">
        </div>

        <div class="form-actions">
          <button type="button" class="btn btn-secondary" onclick="window.closeModal()">Cancelar</button>
          <button type="submit" class="btn btn-primary">Atualizar Estado</button>
        </div>
      </form>
    `;

    openModal(html);
  };

  window.saveQuickStatus = async (e, id) => {
    e.preventDefault();
    const newStatus = document.getElementById('quick-status-select').value;
    const assignedTo = document.getElementById('quick-assigned').value.trim();
    const location = document.getElementById('quick-location').value.trim();

    try {
      await apiFetch(`/equipments/${id}/status`, {
        method: 'POST',
        body: JSON.stringify({ status: newStatus, assignedTo, location })
      });
      showToast(`Estado atualizado para '${newStatus}'!`, 'success');
      closeModal();
      await loadAllData();
      syncLocalBackup();
    } catch (err) {
      alert('Erro: ' + err.message);
    }
  };

  // ==========================================================
  // ELIMINAR EQUIPAMENTO
  // ==========================================================
  window.deleteEquipmentPrompt = async (id) => {
    const item = state.equipments.find(e => e.id === id);
    if (!item) return;

    if (!confirm(`Deseja mesmo eliminar o equipamento ${item.assetTag} (${item.modelName})?`)) {
      return;
    }

    try {
      await apiFetch(`/equipments/${id}`, { method: 'DELETE' });
      showToast('Equipamento eliminado com sucesso!', 'success');
      await loadAllData();
      syncLocalBackup();
    } catch (err) {
      alert('Erro ao eliminar: ' + err.message);
    }
  };

  // ==========================================================
  // MODAL: NOVO / EDITAR MODELO
  // ==========================================================
  window.openNewModelModal = () => {
    const html = `
      <div class="modal-header">
        <h2>Registar Novo Modelo TI</h2>
        <button class="btn-close-modal" onclick="window.closeModal()">&times;</button>
      </div>

      <form onsubmit="window.saveModelForm(event, null)">
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">Marca Fabricante *</label>
            <select class="form-select" id="model-brand-id" required>
              ${state.brands.map(b => `<option value="${b.id}">${escapeHtml(b.name)}</option>`).join('')}
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Nome do Modelo *</label>
            <input type="text" class="form-input" id="model-name" placeholder="Ex: Latitude 5540" required>
          </div>

          <div class="form-group">
            <label class="form-label">Categoria *</label>
            <select class="form-select" id="model-category" required>
              <option value="Portáteis">Portáteis</option>
              <option value="Desktops">Desktops</option>
              <option value="Monitores">Monitores</option>
              <option value="Servidores">Servidores</option>
              <option value="Workstations">Workstations</option>
              <option value="Redes">Redes</option>
              <option value="Tablets">Tablets</option>
              <option value="Impressoras">Impressoras</option>
              <option value="Telecomunicações">Telecomunicações</option>
              <option value="Acessórios">Acessórios</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Preço Base de Referência (€)</label>
            <input type="number" step="0.01" class="form-input" id="model-price" value="1000.00">
          </div>

          <div class="form-group form-full">
            <label class="form-label">Especificações Técnicas</label>
            <textarea class="form-textarea" id="model-specs" placeholder="Ex: Processador, Memória RAM, Armazenamento, Portas e Ecrã..."></textarea>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" class="btn btn-secondary" onclick="window.closeModal()">Cancelar</button>
          <button type="submit" class="btn btn-primary">Gravar Modelo</button>
        </div>
      </form>
    `;

    openModal(html);
  };

  window.openEditModelModal = (id) => {
    const item = state.models.find(m => m.id === id);
    if (!item) return;

    const html = `
      <div class="modal-header">
        <h2>Editar Modelo: ${escapeHtml(item.name)}</h2>
        <button class="btn-close-modal" onclick="window.closeModal()">&times;</button>
      </div>

      <form onsubmit="window.saveModelForm(event, '${item.id}')">
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">Marca Fabricante *</label>
            <select class="form-select" id="model-brand-id" required>
              ${state.brands.map(b => `<option value="${b.id}" ${b.id === item.brandId ? 'selected' : ''}>${escapeHtml(b.name)}</option>`).join('')}
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Nome do Modelo *</label>
            <input type="text" class="form-input" id="model-name" value="${escapeHtml(item.name)}" required>
          </div>

          <div class="form-group">
            <label class="form-label">Categoria *</label>
            <input type="text" class="form-input" id="model-category" value="${escapeHtml(item.category || '')}" required>
          </div>

          <div class="form-group">
            <label class="form-label">Preço Base de Referência (€)</label>
            <input type="number" step="0.01" class="form-input" id="model-price" value="${item.basePrice || 0}">
          </div>

          <div class="form-group form-full">
            <label class="form-label">Especificações Técnicas</label>
            <textarea class="form-textarea" id="model-specs">${escapeHtml(item.specs || '')}</textarea>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" class="btn btn-secondary" onclick="window.closeModal()">Cancelar</button>
          <button type="submit" class="btn btn-primary">Guardar Alterações</button>
        </div>
      </form>
    `;

    openModal(html);
  };

  window.saveModelForm = async (e, existingId) => {
    e.preventDefault();
    const payload = {
      brandId: document.getElementById('model-brand-id').value,
      name: document.getElementById('model-name').value.trim(),
      category: document.getElementById('model-category').value.trim(),
      basePrice: parseFloat(document.getElementById('model-price').value) || 0,
      specs: document.getElementById('model-specs').value.trim()
    };

    try {
      if (existingId) {
        await apiFetch(`/models/${existingId}`, { method: 'PUT', body: JSON.stringify(payload) });
        showToast('Modelo atualizado com sucesso!', 'success');
      } else {
        await apiFetch('/models', { method: 'POST', body: JSON.stringify(payload) });
        showToast('Novo modelo registado com sucesso!', 'success');
      }

      closeModal();
      await loadAllData();
      syncLocalBackup();
    } catch (err) {
      alert('Erro ao gravar modelo: ' + err.message);
    }
  };

  window.deleteModelPrompt = async (id) => {
    const item = state.models.find(m => m.id === id);
    if (!item) return;

    const count = state.equipments.filter(e => e.modelId === id).length;
    if (count > 0) {
      alert(`Não é possível eliminar o modelo '${item.name}' porque existem ${count} equipamentos associados a ele.`);
      return;
    }

    if (!confirm(`Deseja eliminar o modelo '${item.name}'?`)) return;

    try {
      await apiFetch(`/models/${id}`, { method: 'DELETE' });
      showToast('Modelo eliminado!', 'success');
      await loadAllData();
      syncLocalBackup();
    } catch (err) {
      alert('Erro: ' + err.message);
    }
  };

  // ==========================================================
  // MODAL: NOVO / EDITAR MARCA
  // ==========================================================
  window.openNewBrandModal = () => {
    const html = `
      <div class="modal-header">
        <h2>Registar Nova Marca</h2>
        <button class="btn-close-modal" onclick="window.closeModal()">&times;</button>
      </div>

      <form onsubmit="window.saveBrandForm(event, null)">
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">Nome da Marca *</label>
            <input type="text" class="form-input" id="brand-name" placeholder="Ex: Asus, Acer, Sony..." required>
          </div>

          <div class="form-group">
            <label class="form-label">Sigla / Código (3-4 letras) *</label>
            <input type="text" class="form-input" id="brand-code" placeholder="Ex: ASUS" required>
          </div>

          <div class="form-group">
            <label class="form-label">País de Origem</label>
            <input type="text" class="form-input" id="brand-country" value="Internacional">
          </div>

          <div class="form-group">
            <label class="form-label">Categoria Principal</label>
            <input type="text" class="form-input" id="brand-category" value="Hardware & Dispositivos">
          </div>

          <div class="form-group form-full">
            <label class="form-label">Website Oficial</label>
            <input type="url" class="form-input" id="brand-website" placeholder="https://...">
          </div>

          <div class="form-group form-full">
            <label class="form-label">Descrição Institucional</label>
            <textarea class="form-textarea" id="brand-desc" placeholder="Resumo sobre a empresa, foco de produtos e garantias..."></textarea>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" class="btn btn-secondary" onclick="window.closeModal()">Cancelar</button>
          <button type="submit" class="btn btn-primary">Gravar Marca</button>
        </div>
      </form>
    `;

    openModal(html);
  };

  window.openEditBrandModal = (id) => {
    const item = state.brands.find(b => b.id === id);
    if (!item) return;

    const html = `
      <div class="modal-header">
        <h2>Editar Marca: ${escapeHtml(item.name)}</h2>
        <button class="btn-close-modal" onclick="window.closeModal()">&times;</button>
      </div>

      <form onsubmit="window.saveBrandForm(event, '${item.id}')">
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">Nome da Marca *</label>
            <input type="text" class="form-input" id="brand-name" value="${escapeHtml(item.name)}" required>
          </div>

          <div class="form-group">
            <label class="form-label">Sigla / Código *</label>
            <input type="text" class="form-input" id="brand-code" value="${escapeHtml(item.code || '')}" required>
          </div>

          <div class="form-group">
            <label class="form-label">País de Origem</label>
            <input type="text" class="form-input" id="brand-country" value="${escapeHtml(item.country || '')}">
          </div>

          <div class="form-group">
            <label class="form-label">Categoria Principal</label>
            <input type="text" class="form-input" id="brand-category" value="${escapeHtml(item.category || '')}">
          </div>

          <div class="form-group form-full">
            <label class="form-label">Website Oficial</label>
            <input type="url" class="form-input" id="brand-website" value="${escapeHtml(item.website || '')}">
          </div>

          <div class="form-group form-full">
            <label class="form-label">Descrição Institucional</label>
            <textarea class="form-textarea" id="brand-desc">${escapeHtml(item.description || '')}</textarea>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" class="btn btn-secondary" onclick="window.closeModal()">Cancelar</button>
          <button type="submit" class="btn btn-primary">Guardar Alterações</button>
        </div>
      </form>
    `;

    openModal(html);
  };

  window.saveBrandForm = async (e, existingId) => {
    e.preventDefault();
    const payload = {
      name: document.getElementById('brand-name').value.trim(),
      code: document.getElementById('brand-code').value.trim().toUpperCase(),
      country: document.getElementById('brand-country').value.trim(),
      category: document.getElementById('brand-category').value.trim(),
      website: document.getElementById('brand-website').value.trim(),
      description: document.getElementById('brand-desc').value.trim()
    };

    try {
      if (existingId) {
        await apiFetch(`/brands/${existingId}`, { method: 'PUT', body: JSON.stringify(payload) });
        showToast('Marca atualizada com sucesso!', 'success');
      } else {
        await apiFetch('/brands', { method: 'POST', body: JSON.stringify(payload) });
        showToast('Nova marca adicionada com sucesso!', 'success');
      }

      closeModal();
      await loadAllData();
      syncLocalBackup();
    } catch (err) {
      alert('Erro: ' + err.message);
    }
  };

  window.deleteBrandPrompt = async (id) => {
    const item = state.brands.find(b => b.id === id);
    if (!item) return;

    const modCount = state.models.filter(m => m.brandId === id).length;
    if (modCount > 0) {
      alert(`Não é possível eliminar a marca '${item.name}' porque tem ${modCount} modelos registados.`);
      return;
    }

    if (!confirm(`Deseja eliminar a marca '${item.name}'?`)) return;

    try {
      await apiFetch(`/brands/${id}`, { method: 'DELETE' });
      showToast('Marca eliminada!', 'success');
      await loadAllData();
      syncLocalBackup();
    } catch (err) {
      alert('Erro: ' + err.message);
    }
  };

  // ==========================================================
  // EXPORTAÇÕES E IMPORTAÇÕES
  // ==========================================================
  window.exportCSV = () => {
    const items = state.equipments;
    if (!items || items.length === 0) {
      alert('Sem equipamentos para exportar.');
      return;
    }

    const headers = ['Patrimonio', 'NumeroDeSerie', 'Marca', 'Modelo', 'Categoria', 'Estado', 'AtribuidoA', 'Localizacao', 'DataAquisicao', 'ValorEUR', 'Especificacoes'];
    const rows = items.map(e => [
      `"${(e.assetTag || '').replace(/"/g, '""')}"`,
      `"${(e.serialNumber || '').replace(/"/g, '""')}"`,
      `"${(e.brandName || '').replace(/"/g, '""')}"`,
      `"${(e.modelName || '').replace(/"/g, '""')}"`,
      `"${(e.category || '').replace(/"/g, '""')}"`,
      `"${(e.status || '').replace(/"/g, '""')}"`,
      `"${(e.assignedTo || '').replace(/"/g, '""')}"`,
      `"${(e.location || '').replace(/"/g, '""')}"`,
      `"${(e.acquisitionDate || '').replace(/"/g, '""')}"`,
      Number(e.value || 0).toFixed(2),
      `"${(e.specs || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = '\uFEFF' + headers.join(';') + '\n' + rows.map(r => r.join(';')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `inventario-equipamentos-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Ficheiro CSV gerado e descarregado!', 'success');
  };

  window.exportJSON = () => {
    const data = {
      metadata: {
        exportedAt: new Date().toISOString(),
        totalBrands: state.brands.length,
        totalModels: state.models.length,
        totalEquipments: state.equipments.length
      },
      brands: state.brands,
      models: state.models,
      equipments: state.equipments
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup-inventario-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Backup JSON descarregado!', 'success');
  };

  window.handleImportFile = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        if (!parsed.brands || !parsed.models || !parsed.equipments) {
          throw new Error('Formato JSON incompatível. O ficheiro deve conter marcas, modelos e equipamentos.');
        }

        await apiFetch('/import', { method: 'POST', body: JSON.stringify(parsed) });
        showToast('Dados importados com sucesso!', 'success');
        await loadAllData();
        syncLocalBackup();
      } catch (err) {
        alert('Falha ao importar: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  window.resetDatabasePrompt = async () => {
    if (!confirm('Atenção: Esta ação irá repor o inventário para os 200 equipamentos originais (5 Marcas, 50 Modelos). Deseja continuar?')) {
      return;
    }

    try {
      await apiFetch('/reset', { method: 'POST' });
      showToast('Inventário restaurado para os 200 equipamentos originais!', 'success');
      await loadAllData();
      syncLocalBackup();
      setTab('dashboard');
    } catch (err) {
      if (window.INITIAL_DATABASE) {
        state.brands = JSON.parse(JSON.stringify(window.INITIAL_DATABASE.brands));
        state.models = JSON.parse(JSON.stringify(window.INITIAL_DATABASE.models));
        state.equipments = JSON.parse(JSON.stringify(window.INITIAL_DATABASE.equipments));
        syncLocalBackup();
        showToast('Inventário restaurado para os 200 equipamentos originais!', 'success');
        render();
        setTab('dashboard');
      } else {
        alert('Erro ao restaurar: ' + err.message);
      }
    }
  };

  // Inicialização
  document.addEventListener('DOMContentLoaded', () => {
    loadAllData();
    setupElectronIntegration();
  });

  // Executa imediatamente se já carregado
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    loadAllData();
    setupElectronIntegration();
  }

  // ==========================================================
  // INTEGRAÇÃO COM ELECTRON (Menu Nativo, Diálogos, etc.)
  // ==========================================================
  function setupElectronIntegration() {
    if (!window.electronAPI) return; // não é Electron

    // Navegação via menu nativo (Ctrl+1, Ctrl+2, etc.)
    window.electronAPI.onNavigate((tab) => {
      setTab(tab);
    });

    // Reset da base de dados via menu Ferramentas
    window.electronAPI.onResetDatabase(() => {
      window.resetDatabasePrompt();
    });

    // Exportar CSV via menu (com diálogo nativo de guardar ficheiro)
    window.electronAPI.onExportCsvToPath(async (filePath) => {
      const items = state.equipments;
      const headers = ['Patrimonio', 'NumeroDeSerie', 'Marca', 'Modelo', 'Categoria', 'Estado', 'AtribuidoA', 'Localizacao', 'DataAquisicao', 'ValorEUR', 'Especificacoes'];
      const rows = items.map(e => [
        `"${(e.assetTag || '').replace(/"/g, '""')}"`,
        `"${(e.serialNumber || '').replace(/"/g, '""')}"`,
        `"${(e.brandName || '').replace(/"/g, '""')}"`,
        `"${(e.modelName || '').replace(/"/g, '""')}"`,
        `"${(e.category || '').replace(/"/g, '""')}"`,
        `"${(e.status || '').replace(/"/g, '""')}"`,
        `"${(e.assignedTo || '').replace(/"/g, '""')}"`,
        `"${(e.location || '').replace(/"/g, '""')}"`,
        `"${(e.acquisitionDate || '').replace(/"/g, '""')}"`,
        Number(e.value || 0).toFixed(2),
        `"${(e.specs || '').replace(/"/g, '""')}"`
      ]);
      const csvContent = '\uFEFF' + headers.join(';') + '\n' + rows.map(r => r.join(';')).join('\n');

      const result = await window.electronAPI.saveFile(filePath, csvContent);
      if (result.success) {
        showToast(`CSV exportado com sucesso para: ${filePath.split('\\').pop()}`, 'success');
      } else {
        showToast('Erro ao exportar: ' + result.error, 'error');
      }
    });

    // Exportar JSON completo via menu
    window.electronAPI.onExportJsonToPath(async (filePath) => {
      const data = {
        metadata: {
          exportedAt: new Date().toISOString(),
          totalBrands: state.brands.length,
          totalModels: state.models.length,
          totalEquipments: state.equipments.length
        },
        brands: state.brands,
        models: state.models,
        equipments: state.equipments
      };
      const result = await window.electronAPI.saveFile(filePath, JSON.stringify(data, null, 2));
      if (result.success) {
        showToast(`Backup JSON guardado: ${filePath.split('\\').pop()}`, 'success');
      } else {
        showToast('Erro ao exportar: ' + result.error, 'error');
      }
    });

    // Importar JSON via menu
    window.electronAPI.onImportJsonFromPath(async (filePath) => {
      const result = await window.electronAPI.readFile(filePath);
      if (!result.success) {
        showToast('Erro ao ler ficheiro: ' + result.error, 'error');
        return;
      }
      try {
        const parsed = JSON.parse(result.content);
        if (!parsed.brands || !parsed.models || !parsed.equipments) {
          throw new Error('Estrutura JSON inválida.');
        }
        await apiFetch('/import', { method: 'POST', body: JSON.stringify(parsed) });
        showToast('Dados importados com sucesso!', 'success');
        await loadAllData();
        syncLocalBackup();
      } catch (err) {
        // Fallback offline
        try {
          const parsed = JSON.parse(result.content);
          state.brands = parsed.brands || [];
          state.models = parsed.models || [];
          state.equipments = parsed.equipments || [];
          syncLocalBackup();
          showToast('Dados importados (modo local)!', 'success');
          render();
        } catch (e2) {
          showToast('Erro: ' + e2.message, 'error');
        }
      }
    });
  }

  // Sobrescreve exportCSV para usar diálogo nativo quando em Electron
  const _originalExportCSV = window.exportCSV;
  window.exportCSV = async function() {
    if (window.electronAPI) {
      const result = await window.electronAPI.showSaveDialog({
        title: 'Exportar Inventário como CSV',
        defaultPath: `inventario-${new Date().toISOString().slice(0, 10)}.csv`,
        filters: [
          { name: 'CSV (compatível Excel)', extensions: ['csv'] },
          { name: 'Todos os ficheiros', extensions: ['*'] }
        ]
      });
      if (!result.canceled && result.filePath) {
        window.electronAPI.onExportCsvToPath && null; // evita chamar o listener
        const items = state.equipments;
        const headers = ['Patrimonio', 'NumeroDeSerie', 'Marca', 'Modelo', 'Categoria', 'Estado', 'AtribuidoA', 'Localizacao', 'DataAquisicao', 'ValorEUR', 'Especificacoes'];
        const rows = items.map(e => [
          `"${(e.assetTag || '').replace(/"/g, '""')}"`,
          `"${(e.serialNumber || '').replace(/"/g, '""')}"`,
          `"${(e.brandName || '').replace(/"/g, '""')}"`,
          `"${(e.modelName || '').replace(/"/g, '""')}"`,
          `"${(e.category || '').replace(/"/g, '""')}"`,
          `"${(e.status || '').replace(/"/g, '""')}"`,
          `"${(e.assignedTo || '').replace(/"/g, '""')}"`,
          `"${(e.location || '').replace(/"/g, '""')}"`,
          `"${(e.acquisitionDate || '').replace(/"/g, '""')}"`,
          Number(e.value || 0).toFixed(2),
          `"${(e.specs || '').replace(/"/g, '""')}"`
        ]);
        const csvContent = '\uFEFF' + headers.join(';') + '\n' + rows.map(r => r.join(';')).join('\n');
        const saveResult = await window.electronAPI.saveFile(result.filePath, csvContent);
        if (saveResult.success) {
          showToast(`CSV exportado: ${result.filePath.split('\\').pop()}`, 'success');
        } else {
          showToast('Erro ao exportar!', 'error');
        }
      }
    } else {
      // Fallback browser: download direto
      if (_originalExportCSV) _originalExportCSV();
      else {
        const items = state.equipments;
        const headers = ['Patrimonio', 'NumeroDeSerie', 'Marca', 'Modelo', 'Categoria', 'Estado', 'AtribuidoA', 'Localizacao', 'DataAquisicao', 'ValorEUR'];
        const rows = items.map(e => [
          `"${e.assetTag}"`, `"${e.serialNumber}"`, `"${e.brandName}"`, `"${e.modelName}"`,
          `"${e.category}"`, `"${e.status}"`, `"${e.assignedTo || ''}"`,
          `"${e.location || ''}"`, `"${e.acquisitionDate}"`, Number(e.value || 0).toFixed(2)
        ]);
        const csv = '\uFEFF' + headers.join(';') + '\n' + rows.map(r => r.join(';')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `inventario-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(a.href);
        showToast('CSV exportado!', 'success');
      }
    }
  };

  // Sobrescreve exportJSON para usar diálogo nativo quando em Electron
  window.exportJSON = async function() {
    const data = {
      metadata: { exportedAt: new Date().toISOString(), totalBrands: state.brands.length, totalModels: state.models.length, totalEquipments: state.equipments.length },
      brands: state.brands, models: state.models, equipments: state.equipments
    };
    const content = JSON.stringify(data, null, 2);

    if (window.electronAPI) {
      const result = await window.electronAPI.showSaveDialog({
        title: 'Guardar Backup Completo',
        defaultPath: `backup-inventario-${new Date().toISOString().slice(0, 10)}.json`,
        filters: [{ name: 'JSON', extensions: ['json'] }, { name: 'Todos', extensions: ['*'] }]
      });
      if (!result.canceled && result.filePath) {
        const saveResult = await window.electronAPI.saveFile(result.filePath, content);
        if (saveResult.success) {
          showToast(`Backup guardado: ${result.filePath.split('\\').pop()}`, 'success');
        } else {
          showToast('Erro ao guardar!', 'error');
        }
      }
    } else {
      const blob = new Blob([content], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `backup-inventario-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(a.href);
      showToast('Backup JSON descarregado!', 'success');
    }
  };
})();
