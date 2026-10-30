(function () {
  'use strict';

  function injectStyles() {
    const css = `
      :root {
        --primary: #4f46e5;
        --primary-hover: #4338ca;
        --primary-light: #eef2ff;
        --secondary: #0ea5e9;
        --success: #10b981;
        --success-light: #ecfdf5;
        --warning: #f59e0b;
        --warning-light: #fffbeb;
        --danger: #ef4444;
        --danger-light: #fef2f2;
        --dark: #0f172a;
        --slate-800: #1e293b;
        --slate-600: #475569;
        --slate-500: #64748b;
        --slate-300: #cbd5e1;
        --slate-200: #e2e8f0;
        --slate-100: #f1f5f9;
        --slate-50: #f8fafc;
        --white: #ffffff;
        --radius: 12px;
        --radius-sm: 8px;
        --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
        --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
        --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
        --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
        --font-sans: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      }

      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }

      body {
        font-family: var(--font-sans);
        background: #f1f5f9;
        color: var(--slate-800);
        line-height: 1.5;
        -webkit-font-smoothing: antialiased;
        padding-bottom: 50px;
      }

      .app-container {
        max-width: 1280px;
        margin: 0 auto;
        padding: 24px 20px;
      }

      .header-card {
        background: linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%);
        color: var(--white);
        padding: 24px 32px;
        border-radius: var(--radius);
        box-shadow: var(--shadow-lg);
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        align-items: center;
        gap: 20px;
        margin-bottom: 24px;
      }

      .header-title-box h1 {
        font-size: 24px;
        font-weight: 700;
        letter-spacing: -0.5px;
      }

      .header-actions {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
      }

      .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 16px;
        margin-bottom: 24px;
      }

      .stat-card {
        background: var(--white);
        border: 1px solid var(--slate-200);
        padding: 18px 20px;
        border-radius: var(--radius);
        box-shadow: var(--shadow-sm);
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .stat-info .stat-label {
        font-size: 13px;
        font-weight: 600;
        color: var(--slate-500);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .stat-info .stat-value {
        font-size: 24px;
        font-weight: 800;
        color: var(--dark);
        margin-top: 4px;
      }

      .stat-icon {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 22px;
      }

      .stat-icon.blue { background: #e0f2fe; color: #0284c7; }
      .stat-icon.green { background: #dcfce7; color: #16a34a; }
      .stat-icon.amber { background: #fef3c7; color: #d97706; }
      .stat-icon.red { background: #fee2e2; color: #dc2626; }

      .toolbar-card {
        background: var(--white);
        border: 1px solid var(--slate-200);
        padding: 18px 20px;
        border-radius: var(--radius);
        box-shadow: var(--shadow-sm);
        margin-bottom: 20px;
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .toolbar-row {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }

      .search-box {
        position: relative;
        flex: 1 1 320px;
      }

      .search-box svg {
        position: absolute;
        left: 14px;
        top: 50%;
        transform: translateY(-50%);
        width: 18px;
        height: 18px;
        fill: none;
        stroke: var(--slate-400, #94a3b8);
        stroke-width: 2;
        pointer-events: none;
      }

      .search-input {
        width: 100%;
        padding: 10px 14px 10px 42px;
        border: 1px solid var(--slate-300);
        border-radius: var(--radius-sm);
        font-size: 14px;
        outline: none;
        background: var(--slate-50);
      }

      .search-input:focus {
        border-color: var(--primary);
        background: var(--white);
        box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.15);
      }

      .filters-group {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
      }

      .select-custom {
        padding: 10px 14px;
        border: 1px solid var(--slate-300);
        border-radius: var(--radius-sm);
        font-size: 14px;
        color: var(--slate-800);
        background-color: var(--white);
        outline: none;
        cursor: pointer;
      }

      .select-custom:focus {
        border-color: var(--primary);
        box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.15);
      }

      .status-pills {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
      }

      .pill-btn {
        padding: 6px 14px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        border: 1px solid var(--slate-300);
        background: var(--white);
        color: var(--slate-600);
      }

      .pill-btn.active {
        background: var(--primary);
        color: var(--white);
        border-color: var(--primary);
      }

      .btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 10px 16px;
        font-size: 14px;
        font-weight: 600;
        border-radius: var(--radius-sm);
        cursor: pointer;
        border: none;
        text-decoration: none;
        white-space: nowrap;
      }

      .btn-primary {
        background: var(--primary);
        color: var(--white);
      }

      .btn-primary:hover {
        background: var(--primary-hover);
      }

      .btn-secondary {
        background: var(--white);
        color: var(--slate-800);
        border: 1px solid var(--slate-300);
      }

      .btn-secondary:hover {
        background: var(--slate-50);
      }

      .btn-danger-outline {
        background: transparent;
        color: var(--danger);
        border: 1px solid #fca5a5;
        padding: 6px 10px;
        font-size: 13px;
      }

      .btn-danger-outline:hover {
        background: var(--danger-light);
      }

      .btn-edit-outline {
        background: transparent;
        color: var(--primary);
        border: 1px solid #c7d2fe;
        padding: 6px 10px;
        font-size: 13px;
      }

      .btn-edit-outline:hover {
        background: var(--primary-light);
      }

      .btn-icon-step {
        width: 24px;
        height: 24px;
        padding: 0;
        border-radius: 4px;
        font-size: 13px;
        font-weight: bold;
        border: 1px solid var(--slate-300);
        background: var(--white);
        color: var(--slate-800);
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }

      .table-card {
        background: var(--white);
        border: 1px solid var(--slate-200);
        border-radius: var(--radius);
        box-shadow: var(--shadow-sm);
        overflow: hidden;
      }

      .table-responsive {
        width: 100%;
        overflow-x: auto;
      }

      table.inventory-table {
        width: 100%;
        border-collapse: collapse;
        text-align: left;
        font-size: 14px;
      }

      table.inventory-table th {
        background: var(--slate-50);
        color: var(--slate-600);
        font-weight: 700;
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 0.6px;
        padding: 14px 18px;
        border-bottom: 1px solid var(--slate-200);
        user-select: none;
      }

      table.inventory-table td {
        padding: 14px 18px;
        border-bottom: 1px solid var(--slate-200);
        color: var(--slate-800);
        vertical-align: middle;
      }

      table.inventory-table tr:hover td {
        background-color: #f8fafc;
      }

      .badge-sku {
        font-family: monospace;
        font-size: 12px;
        background: var(--slate-100);
        color: var(--slate-800);
        padding: 3px 6px;
        border-radius: 4px;
        border: 1px solid var(--slate-200);
        font-weight: 600;
      }

      .badge-cat {
        font-size: 11px;
        font-weight: 600;
        background: #e0e7ff;
        color: #3730a3;
        padding: 3px 8px;
        border-radius: 12px;
      }

      .badge-stock {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 4px 10px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 700;
      }

      .badge-stock.in-stock {
        background: var(--success-light);
        color: #065f46;
      }

      .badge-stock.low-stock {
        background: var(--warning-light);
        color: #92400e;
      }

      .badge-stock.out-of-stock {
        background: var(--danger-light);
        color: #991b1b;
      }

      .stock-stepper {
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .product-title {
        font-weight: 600;
        color: var(--dark);
      }

      .product-supplier {
        font-size: 12px;
        color: var(--slate-500);
      }

      .items-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
        gap: 18px;
        padding: 20px;
      }

      .item-grid-card {
        background: var(--white);
        border: 1px solid var(--slate-200);
        border-radius: var(--radius);
        padding: 18px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        gap: 12px;
        box-shadow: var(--shadow-sm);
      }

      .item-grid-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
      }

      .item-grid-actions {
        display: flex;
        gap: 8px;
        margin-top: 10px;
        padding-top: 12px;
        border-top: 1px solid var(--slate-100);
      }

      .empty-state {
        text-align: center;
        padding: 60px 20px;
      }

      .empty-state h3 {
        font-size: 18px;
        color: var(--dark);
        margin-bottom: 16px;
      }

      .table-footer {
        padding: 14px 20px;
        background: var(--slate-50);
        border-top: 1px solid var(--slate-200);
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 13px;
        color: var(--slate-600);
      }

      .modal-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(15, 23, 42, 0.6);
        backdrop-filter: blur(4px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        padding: 20px;
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.2s ease, visibility 0.2s ease;
      }

      .modal-backdrop.open {
        opacity: 1;
        visibility: visible;
      }

      .modal-content {
        background: var(--white);
        border-radius: var(--radius);
        width: 100%;
        max-width: 560px;
        box-shadow: var(--shadow-xl);
        overflow: hidden;
        max-height: 90vh;
        display: flex;
        flex-direction: column;
      }

      .modal-header {
        padding: 18px 24px;
        border-bottom: 1px solid var(--slate-200);
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .modal-header h3 {
        font-size: 18px;
        font-weight: 700;
        color: var(--dark);
      }

      .modal-close-btn {
        background: none;
        border: none;
        font-size: 20px;
        cursor: pointer;
        color: var(--slate-400);
        padding: 4px;
        border-radius: 4px;
      }

      .modal-body {
        padding: 24px;
        overflow-y: auto;
      }

      .form-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
      }

      .form-group {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .form-group.full-width {
        grid-column: span 2;
      }

      .form-label {
        font-size: 13px;
        font-weight: 600;
        color: var(--slate-800);
      }

      .form-input, .form-textarea, .form-select {
        padding: 10px 12px;
        border: 1px solid var(--slate-300);
        border-radius: var(--radius-sm);
        font-size: 14px;
        color: var(--dark);
        background: var(--white);
        outline: none;
        font-family: inherit;
      }

      .form-input:focus, .form-textarea:focus, .form-select:focus {
        border-color: var(--primary);
        box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.15);
      }

      .form-textarea {
        resize: vertical;
        min-height: 80px;
      }

      .input-with-action {
        display: flex;
        gap: 8px;
      }

      .modal-footer {
        padding: 16px 24px;
        border-top: 1px solid var(--slate-200);
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        background: var(--slate-50);
      }

      .toast-container {
        position: fixed;
        bottom: 24px;
        right: 24px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        z-index: 10000;
        pointer-events: none;
      }

      .toast {
        background: var(--dark);
        color: var(--white);
        padding: 12px 18px;
        border-radius: var(--radius-sm);
        box-shadow: var(--shadow-lg);
        font-size: 14px;
        font-weight: 500;
        pointer-events: auto;
      }

      .toast.success { background: #065f46; }
      .toast.error { background: #991b1b; }
      .toast.warning { background: #92400e; }
      .toast.info { background: #1e293b; }

      @media (max-width: 768px) {
        .header-card {
          flex-direction: column;
          align-items: flex-start;
        }
        .header-actions {
          width: 100%;
          justify-content: flex-start;
        }
        .form-grid {
          grid-template-columns: 1fr;
        }
        .form-group.full-width {
          grid-column: span 1;
        }
        .toolbar-row {
          flex-direction: column;
          align-items: stretch;
        }
      }
    `;

    const styleEl = document.createElement('style');
    styleEl.textContent = css;
    document.head.appendChild(styleEl);
  }

  const state = {
    products: [],
    stats: {
      totalProducts: 0,
      totalQuantity: 0,
      totalValue: 0,
      outOfStock: 0,
      lowStock: 0,
      categories: {}
    },
    filters: {
      search: '',
      category: 'all',
      status: 'all',
      sortBy: 'name',
      sortOrder: 'asc'
    },
    viewMode: 'table',
    modal: {
      isOpen: false,
      mode: 'create',
      currentId: null
    },
    deleteModal: {
      isOpen: false,
      targetId: null,
      targetName: ''
    },
    isApiAvailable: true
  };

  const STORAGE_KEY = 'gestor_inventario_local_db';

  async function apiRequest(endpoint, options = {}) {
    try {
      const res = await fetch(endpoint, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {})
        }
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || `HTTP ${res.status}`);
      }
      return await res.json();
    } catch (err) {
      state.isApiAvailable = false;
      return null;
    }
  }

  function getLocalProducts() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      {
        id: "prod-1",
        name: "Portátil Pro 15.6\" 16GB",
        sku: "TECH-001",
        category: "Informática",
        price: 899.99,
        quantity: 14,
        minStock: 5,
        supplier: "TechSupply Lda",
        description: "Portátil com processador de alto desempenho e ecrã FHD.",
        updatedAt: new Date().toISOString()
      },
      {
        id: "prod-2",
        name: "Rato Sem Fios Ergonómico",
        sku: "ACC-002",
        category: "Acessórios",
        price: 29.90,
        quantity: 4,
        minStock: 10,
        supplier: "Global Peripherals",
        description: "Rato ergonómico recarregável com sensor ótico de alta precisão.",
        updatedAt: new Date().toISOString()
      },
      {
        id: "prod-3",
        name: "Teclado Mecânico RGB",
        sku: "ACC-003",
        category: "Acessórios",
        price: 79.50,
        quantity: 0,
        minStock: 5,
        supplier: "Global Peripherals",
        description: "Teclado mecânico com switches azuis e retroiluminação personalizável.",
        updatedAt: new Date().toISOString()
      }
    ];
  }

  function saveLocalProducts(products) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    } catch (e) {}
  }

  async function loadData() {
    const queryParams = new URLSearchParams({
      search: state.filters.search,
      category: state.filters.category,
      status: state.filters.status,
      sortBy: state.filters.sortBy,
      sortOrder: state.filters.sortOrder
    });

    const response = await apiRequest(`/api/products?${queryParams.toString()}`);
    const statsResponse = await apiRequest('/api/stats');

    if (response && response.success) {
      state.products = response.data;
      if (statsResponse && statsResponse.success) {
        state.stats = statsResponse.stats;
      }
    } else {
      let items = getLocalProducts();
      
      if (state.filters.search) {
        const s = state.filters.search.toLowerCase().trim();
        items = items.filter(i =>
          i.name.toLowerCase().includes(s) ||
          i.sku.toLowerCase().includes(s) ||
          (i.supplier && i.supplier.toLowerCase().includes(s))
        );
      }
      if (state.filters.category !== 'all') {
        items = items.filter(i => i.category === state.filters.category);
      }
      if (state.filters.status === 'outOfStock') {
        items = items.filter(i => Number(i.quantity) === 0);
      } else if (state.filters.status === 'lowStock') {
        items = items.filter(i => Number(i.quantity) > 0 && Number(i.quantity) <= Number(i.minStock || 5));
      } else if (state.filters.status === 'inStock') {
        items = items.filter(i => Number(i.quantity) > Number(i.minStock || 5));
      }

      items.sort((a, b) => {
        let valA = a[state.filters.sortBy];
        let valB = b[state.filters.sortBy];
        const factor = state.filters.sortOrder === 'desc' ? -1 : 1;
        if (state.filters.sortBy === 'price' || state.filters.sortBy === 'quantity') {
          return (Number(valA) - Number(valB)) * factor;
        }
        return String(valA || '').localeCompare(String(valB || ''), 'pt') * factor;
      });

      state.products = items;

      const allLocal = getLocalProducts();
      let totalQty = 0, totalVal = 0, outStock = 0, lowStock = 0, cats = {};
      allLocal.forEach(it => {
        const q = Number(it.quantity) || 0;
        const p = Number(it.price) || 0;
        const min = Number(it.minStock) || 5;
        totalQty += q;
        totalVal += q * p;
        if (q === 0) outStock++;
        else if (q <= min) lowStock++;
        cats[it.category] = (cats[it.category] || 0) + 1;
      });

      state.stats = {
        totalProducts: allLocal.length,
        totalQuantity: totalQty,
        totalValue: Math.round(totalVal * 100) / 100,
        outOfStock: outStock,
        lowStock: lowStock,
        categories: cats
      };
    }

    renderApp();
  }

  async function createProduct(payload) {
    if (state.isApiAvailable) {
      const res = await apiRequest('/api/products', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      if (res && res.success) {
        showToast('Guardado', 'success');
        await loadData();
        return true;
      }
    }

    const items = getLocalProducts();
    const newItem = {
      id: `prod-${Date.now()}`,
      ...payload,
      updatedAt: new Date().toISOString()
    };
    items.unshift(newItem);
    saveLocalProducts(items);
    showToast('Guardado', 'success');
    await loadData();
    return true;
  }

  async function updateProduct(id, payload) {
    if (state.isApiAvailable) {
      const res = await apiRequest(`/api/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
      if (res && res.success) {
        showToast('Atualizado', 'success');
        await loadData();
        return true;
      }
    }

    const items = getLocalProducts();
    const idx = items.findIndex(i => i.id === id);
    if (idx !== -1) {
      items[idx] = { ...items[idx], ...payload, updatedAt: new Date().toISOString() };
      saveLocalProducts(items);
      showToast('Atualizado', 'success');
      await loadData();
      return true;
    }
    return false;
  }

  async function deleteProduct(id) {
    if (state.isApiAvailable) {
      const res = await apiRequest(`/api/products/${id}`, { method: 'DELETE' });
      if (res && res.success) {
        showToast('Eliminado', 'success');
        await loadData();
        return true;
      }
    }

    let items = getLocalProducts();
    items = items.filter(i => i.id !== id);
    saveLocalProducts(items);
    showToast('Eliminado', 'success');
    await loadData();
    return true;
  }

  async function adjustStock(id, delta) {
    const item = state.products.find(i => i.id === id);
    if (!item) return;

    const newQty = Math.max(0, Number(item.quantity) + delta);
    if (state.isApiAvailable) {
      const res = await apiRequest(`/api/products/${id}/adjust`, {
        method: 'POST',
        body: JSON.stringify({ delta })
      });
      if (res && res.success) {
        await loadData();
        return;
      }
    }

    const items = getLocalProducts();
    const target = items.find(i => i.id === id);
    if (target) {
      target.quantity = newQty;
      target.updatedAt = new Date().toISOString();
      saveLocalProducts(items);
      await loadData();
    }
  }

  async function resetSampleData() {
    if (confirm('Restaurar dados?')) {
      if (state.isApiAvailable) {
        await apiRequest('/api/reset', { method: 'POST' });
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
      showToast('Restaurado', 'info');
      await loadData();
    }
  }

  function exportCSV() {
    const items = state.products;
    if (items.length === 0) return;

    const headers = ['ID', 'Nome', 'SKU', 'Categoria', 'Preco', 'Quantidade', 'StockMinimo', 'Fornecedor', 'Descricao', 'DataAtualizacao'];
    const rows = items.map(i => [
      `"${i.id}"`,
      `"${(i.name || '').replace(/"/g, '""')}"`,
      `"${(i.sku || '').replace(/"/g, '""')}"`,
      `"${(i.category || '').replace(/"/g, '""')}"`,
      i.price,
      i.quantity,
      i.minStock || 5,
      `"${(i.supplier || '').replace(/"/g, '""')}"`,
      `"${(i.description || '').replace(/"/g, '""')}"`,
      `"${i.updatedAt || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `inventario_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  let toastContainer = null;
  function showToast(message, type = 'info') {
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.className = 'toast-container';
      document.body.appendChild(toastContainer);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 2500);
  }

  const appRoot = document.getElementById('app');

  function renderApp() {
    appRoot.innerHTML = '';

    const container = document.createElement('div');
    container.className = 'app-container';

    container.appendChild(createHeader());
    container.appendChild(createStatsGrid());
    container.appendChild(createToolbar());
    container.appendChild(createInventoryContent());

    appRoot.appendChild(container);

    renderProductModal();
    renderDeleteModal();
  }

  function createHeader() {
    const header = document.createElement('header');
    header.className = 'header-card';

    const titleBox = document.createElement('div');
    titleBox.className = 'header-title-box';
    titleBox.innerHTML = `<h1>Gestor de Inventário</h1>`;

    const actions = document.createElement('div');
    actions.className = 'header-actions';

    const addBtn = document.createElement('button');
    addBtn.className = 'btn btn-primary';
    addBtn.textContent = 'Adicionar Produto';
    addBtn.onclick = () => openProductModal('create');

    const exportBtn = document.createElement('button');
    exportBtn.className = 'btn btn-secondary';
    exportBtn.textContent = 'Exportar CSV';
    exportBtn.onclick = exportCSV;

    const resetBtn = document.createElement('button');
    resetBtn.className = 'btn btn-secondary';
    resetBtn.textContent = 'Restaurar';
    resetBtn.onclick = resetSampleData;

    actions.appendChild(addBtn);
    actions.appendChild(exportBtn);
    actions.appendChild(resetBtn);

    header.appendChild(titleBox);
    header.appendChild(actions);
    return header;
  }

  function createStatsGrid() {
    const grid = document.createElement('div');
    grid.className = 'stats-grid';

    const stats = state.stats;
    const formatCurrency = val => new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(val || 0);

    const items = [
      { label: 'Total de Produtos', value: stats.totalProducts, icon: '🏷️', colorClass: 'blue' },
      { label: 'Unidades em Stock', value: stats.totalQuantity, icon: '📊', colorClass: 'green' },
      { label: 'Valor Total', value: formatCurrency(stats.totalValue), icon: '💶', colorClass: 'blue' },
      { label: 'Stock Baixo', value: stats.lowStock, icon: '⚠️', colorClass: 'amber' },
      { label: 'Esgotados', value: stats.outOfStock, icon: '🚫', colorClass: 'red' }
    ];

    items.forEach(item => {
      const card = document.createElement('div');
      card.className = 'stat-card';
      card.innerHTML = `
        <div class="stat-info">
          <div class="stat-label">${item.label}</div>
          <div class="stat-value">${item.value}</div>
        </div>
        <div class="stat-icon ${item.colorClass}">${item.icon}</div>
      `;
      grid.appendChild(card);
    });

    return grid;
  }

  function createToolbar() {
    const card = document.createElement('div');
    card.className = 'toolbar-card';

    const row1 = document.createElement('div');
    row1.className = 'toolbar-row';

    const searchBox = document.createElement('div');
    searchBox.className = 'search-box';
    searchBox.innerHTML = `
      <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
      <input type="text" class="search-input" placeholder="Pesquisar..." value="${state.filters.search}">
    `;
    const searchInput = searchBox.querySelector('input');
    let debounceTimer;
    searchInput.oninput = (e) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        state.filters.search = e.target.value;
        loadData();
      }, 250);
    };

    const filtersGroup = document.createElement('div');
    filtersGroup.className = 'filters-group';

    const catSelect = document.createElement('select');
    catSelect.className = 'select-custom';
    
    const categories = Object.keys(state.stats.categories || {});
    let catOptions = `<option value="all">Todas as Categorias</option>`;
    categories.forEach(cat => {
      const selected = state.filters.category === cat ? 'selected' : '';
      catOptions += `<option value="${cat}" ${selected}>${cat} (${state.stats.categories[cat]})</option>`;
    });
    catSelect.innerHTML = catOptions;
    catSelect.onchange = (e) => {
      state.filters.category = e.target.value;
      loadData();
    };

    const sortSelect = document.createElement('select');
    sortSelect.className = 'select-custom';
    const sortOptions = [
      { id: 'name_asc', label: 'Nome (A-Z)' },
      { id: 'name_desc', label: 'Nome (Z-A)' },
      { id: 'price_asc', label: 'Preço: Menor' },
      { id: 'price_desc', label: 'Preço: Maior' },
      { id: 'quantity_asc', label: 'Quantidade: Menor' },
      { id: 'quantity_desc', label: 'Quantidade: Maior' },
      { id: 'updatedAt_desc', label: 'Recentes' }
    ];
    sortSelect.innerHTML = sortOptions.map(opt => {
      const current = `${state.filters.sortBy}_${state.filters.sortOrder}`;
      return `<option value="${opt.id}" ${current === opt.id ? 'selected' : ''}>${opt.label}</option>`;
    }).join('');

    sortSelect.onchange = (e) => {
      const [by, order] = e.target.value.split('_');
      state.filters.sortBy = by;
      state.filters.sortOrder = order;
      loadData();
    };

    const viewToggle = document.createElement('div');
    viewToggle.style.display = 'flex';
    viewToggle.style.border = '1px solid var(--slate-300)';
    viewToggle.style.borderRadius = 'var(--radius-sm)';
    viewToggle.style.overflow = 'hidden';

    const tableBtn = document.createElement('button');
    tableBtn.className = 'btn';
    tableBtn.style.padding = '8px 12px';
    tableBtn.style.borderRadius = '0';
    tableBtn.style.fontSize = '12px';
    tableBtn.style.background = state.viewMode === 'table' ? 'var(--primary)' : 'var(--white)';
    tableBtn.style.color = state.viewMode === 'table' ? 'var(--white)' : 'var(--slate-800)';
    tableBtn.textContent = 'Tabela';
    tableBtn.onclick = () => {
      state.viewMode = 'table';
      renderApp();
    };

    const gridBtn = document.createElement('button');
    gridBtn.className = 'btn';
    gridBtn.style.padding = '8px 12px';
    gridBtn.style.borderRadius = '0';
    gridBtn.style.fontSize = '12px';
    gridBtn.style.background = state.viewMode === 'grid' ? 'var(--primary)' : 'var(--white)';
    gridBtn.style.color = state.viewMode === 'grid' ? 'var(--white)' : 'var(--slate-800)';
    gridBtn.textContent = 'Grelha';
    gridBtn.onclick = () => {
      state.viewMode = 'grid';
      renderApp();
    };

    viewToggle.appendChild(tableBtn);
    viewToggle.appendChild(gridBtn);

    filtersGroup.appendChild(catSelect);
    filtersGroup.appendChild(sortSelect);
    filtersGroup.appendChild(viewToggle);

    row1.appendChild(searchBox);
    row1.appendChild(filtersGroup);

    const row2 = document.createElement('div');
    row2.className = 'toolbar-row';

    const pillsContainer = document.createElement('div');
    pillsContainer.className = 'status-pills';

    const statuses = [
      { id: 'all', label: 'Todos' },
      { id: 'inStock', label: 'Em Stock' },
      { id: 'lowStock', label: `Stock Baixo (${state.stats.lowStock})` },
      { id: 'outOfStock', label: `Esgotados (${state.stats.outOfStock})` }
    ];

    statuses.forEach(st => {
      const pill = document.createElement('button');
      pill.className = `pill-btn ${state.filters.status === st.id ? 'active' : ''}`;
      pill.textContent = st.label;
      pill.onclick = () => {
        state.filters.status = st.id;
        loadData();
      };
      pillsContainer.appendChild(pill);
    });

    row2.appendChild(pillsContainer);

    card.appendChild(row1);
    card.appendChild(row2);
    return card;
  }

  function createInventoryContent() {
    const card = document.createElement('div');
    card.className = 'table-card';

    if (state.products.length === 0) {
      card.innerHTML = `
        <div class="empty-state">
          <h3>Sem produtos</h3>
          <button class="btn btn-primary" id="btn-empty-add">Adicionar Produto</button>
        </div>
      `;
      card.querySelector('#btn-empty-add').onclick = () => openProductModal('create');
      return card;
    }

    if (state.viewMode === 'grid') {
      card.appendChild(createGridView());
    } else {
      card.appendChild(createTableView());
    }

    const footer = document.createElement('div');
    footer.className = 'table-footer';
    footer.innerHTML = `<div>Total: <strong>${state.products.length}</strong></div>`;
    card.appendChild(footer);

    return card;
  }

  function getStockStatusBadge(quantity, minStock = 5) {
    const q = Number(quantity);
    const min = Number(minStock);

    if (q === 0) {
      return `<span class="badge-stock out-of-stock">Esgotado</span>`;
    }
    if (q <= min) {
      return `<span class="badge-stock low-stock">Baixo (${q})</span>`;
    }
    return `<span class="badge-stock in-stock">Em Stock (${q})</span>`;
  }

  function createTableView() {
    const wrapper = document.createElement('div');
    wrapper.className = 'table-responsive';

    const table = document.createElement('table');
    table.className = 'inventory-table';

    table.innerHTML = `
      <thead>
        <tr>
          <th>Produto</th>
          <th>SKU</th>
          <th>Categoria</th>
          <th>Preço</th>
          <th>Quantidade</th>
          <th>Total</th>
          <th>Estado</th>
          <th style="text-align: right;">Ações</th>
        </tr>
      </thead>
      <tbody></tbody>
    `;

    const tbody = table.querySelector('tbody');
    const formatCurrency = val => new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(val || 0);

    state.products.forEach(item => {
      const tr = document.createElement('tr');
      const totalItemValue = (Number(item.price) || 0) * (Number(item.quantity) || 0);

      tr.innerHTML = `
        <td>
          <div class="product-title">${escapeHtml(item.name)}</div>
          ${item.supplier ? `<div class="product-supplier">${escapeHtml(item.supplier)}</div>` : ''}
        </td>
        <td><span class="badge-sku">${escapeHtml(item.sku || '')}</span></td>
        <td><span class="badge-cat">${escapeHtml(item.category || '')}</span></td>
        <td><strong>${formatCurrency(item.price)}</strong></td>
        <td>
          <div class="stock-stepper">
            <button class="btn-icon-step" data-action="decrease">-</button>
            <span style="font-weight: 700; min-width: 28px; text-align: center;">${item.quantity}</span>
            <button class="btn-icon-step" data-action="increase">+</button>
          </div>
        </td>
        <td>${formatCurrency(totalItemValue)}</td>
        <td>${getStockStatusBadge(item.quantity, item.minStock)}</td>
        <td style="text-align: right;">
          <div style="display: inline-flex; gap: 8px;">
            <button class="btn btn-edit-outline" data-action="edit">Editar</button>
            <button class="btn btn-danger-outline" data-action="delete">Eliminar</button>
          </div>
        </td>
      `;

      tr.querySelector('[data-action="decrease"]').onclick = () => adjustStock(item.id, -1);
      tr.querySelector('[data-action="increase"]').onclick = () => adjustStock(item.id, 1);
      tr.querySelector('[data-action="edit"]').onclick = () => openProductModal('edit', item);
      tr.querySelector('[data-action="delete"]').onclick = () => openDeleteModal(item.id, item.name);

      tbody.appendChild(tr);
    });

    wrapper.appendChild(table);
    return wrapper;
  }

  function createGridView() {
    const grid = document.createElement('div');
    grid.className = 'items-grid';
    const formatCurrency = val => new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(val || 0);

    state.products.forEach(item => {
      const card = document.createElement('div');
      card.className = 'item-grid-card';

      card.innerHTML = `
        <div>
          <div class="item-grid-header">
            <span class="badge-cat">${escapeHtml(item.category || '')}</span>
            <span class="badge-sku">${escapeHtml(item.sku)}</span>
          </div>
          <h4 style="font-size: 16px; font-weight: 700; margin: 10px 0 4px; color: var(--dark);">${escapeHtml(item.name)}</h4>
          <p style="font-size: 13px; color: var(--slate-500); min-height: 38px; line-height: 1.4;">
            ${escapeHtml(item.description || '')}
          </p>
        </div>

        <div style="background: var(--slate-50); padding: 12px; border-radius: var(--radius-sm); border: 1px solid var(--slate-200); margin: 6px 0;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <span style="font-size: 12px; color: var(--slate-500);">Preço:</span>
            <strong style="font-size: 15px; color: var(--dark);">${formatCurrency(item.price)}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <span style="font-size: 12px; color: var(--slate-500);">Stock:</span>
            <div class="stock-stepper">
              <button class="btn-icon-step" data-action="decrease">-</button>
              <strong style="min-width: 24px; text-align: center;">${item.quantity}</strong>
              <button class="btn-icon-step" data-action="increase">+</button>
            </div>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 12px; color: var(--slate-500);">Estado:</span>
            ${getStockStatusBadge(item.quantity, item.minStock)}
          </div>
        </div>

        <div class="item-grid-actions">
          <button class="btn btn-edit-outline" style="flex: 1;" data-action="edit">Editar</button>
          <button class="btn btn-danger-outline" style="flex: 1;" data-action="delete">Eliminar</button>
        </div>
      `;

      card.querySelector('[data-action="decrease"]').onclick = () => adjustStock(item.id, -1);
      card.querySelector('[data-action="increase"]').onclick = () => adjustStock(item.id, 1);
      card.querySelector('[data-action="edit"]').onclick = () => openProductModal('edit', item);
      card.querySelector('[data-action="delete"]').onclick = () => openDeleteModal(item.id, item.name);

      grid.appendChild(card);
    });

    return grid;
  }

  let modalBackdrop = null;

  function renderProductModal() {
    if (modalBackdrop) modalBackdrop.remove();

    modalBackdrop = document.createElement('div');
    modalBackdrop.className = 'modal-backdrop';
    modalBackdrop.id = 'product-modal';

    const isEdit = state.modal.mode === 'edit';
    const currentItem = isEdit ? state.products.find(i => i.id === state.modal.currentId) : null;

    modalBackdrop.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>${isEdit ? 'Editar Produto' : 'Novo Produto'}</h3>
          <button class="modal-close-btn" id="modal-close">&times;</button>
        </div>
        <form id="product-form">
          <div class="modal-body">
            <div class="form-grid">
              
              <div class="form-group full-width">
                <label class="form-label">Nome *</label>
                <input type="text" class="form-input" id="form-name" required value="${currentItem ? escapeHtml(currentItem.name) : ''}">
              </div>

              <div class="form-group">
                <label class="form-label">SKU *</label>
                <div class="input-with-action">
                  <input type="text" class="form-input" id="form-sku" required value="${currentItem ? escapeHtml(currentItem.sku) : ''}">
                  <button type="button" class="btn btn-secondary" id="btn-gen-sku" style="padding: 0 10px; font-size: 12px;">Gerar</button>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Categoria *</label>
                <input type="text" class="form-input" id="form-category" required list="categories-list" value="${currentItem ? escapeHtml(currentItem.category) : ''}">
                <datalist id="categories-list">
                  <option value="Informática">
                  <option value="Acessórios">
                  <option value="Áudio">
                  <option value="Mobiliário">
                </datalist>
              </div>

              <div class="form-group">
                <label class="form-label">Preço (€) *</label>
                <input type="number" step="0.01" min="0" class="form-input" id="form-price" required value="${currentItem ? currentItem.price : ''}">
              </div>

              <div class="form-group">
                <label class="form-label">Quantidade *</label>
                <input type="number" min="0" step="1" class="form-input" id="form-quantity" required value="${currentItem !== null && currentItem !== undefined ? currentItem.quantity : '1'}">
              </div>

              <div class="form-group">
                <label class="form-label">Stock Mínimo</label>
                <input type="number" min="0" step="1" class="form-input" id="form-min-stock" value="${currentItem ? currentItem.minStock : '5'}">
              </div>

              <div class="form-group">
                <label class="form-label">Fornecedor</label>
                <input type="text" class="form-input" id="form-supplier" value="${currentItem ? escapeHtml(currentItem.supplier || '') : ''}">
              </div>

              <div class="form-group full-width">
                <label class="form-label">Descrição</label>
                <textarea class="form-textarea" id="form-description">${currentItem ? escapeHtml(currentItem.description || '') : ''}</textarea>
              </div>

            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" id="btn-cancel">Cancelar</button>
            <button type="submit" class="btn btn-primary" id="btn-save">Guardar</button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(modalBackdrop);

    modalBackdrop.querySelector('#modal-close').onclick = closeProductModal;
    modalBackdrop.querySelector('#btn-cancel').onclick = closeProductModal;

    modalBackdrop.querySelector('#btn-gen-sku').onclick = () => {
      const cat = (modalBackdrop.querySelector('#form-category').value || 'PRD').slice(0, 3).toUpperCase();
      const random = Math.floor(100 + Math.random() * 900);
      modalBackdrop.querySelector('#form-sku').value = `${cat}-${random}`;
    };

    modalBackdrop.onclick = (e) => {
      if (e.target === modalBackdrop) closeProductModal();
    };

    const form = modalBackdrop.querySelector('#product-form');
    form.onsubmit = async (e) => {
      e.preventDefault();

      const payload = {
        name: modalBackdrop.querySelector('#form-name').value.trim(),
        sku: modalBackdrop.querySelector('#form-sku').value.trim().toUpperCase(),
        category: modalBackdrop.querySelector('#form-category').value.trim() || 'Geral',
        price: parseFloat(modalBackdrop.querySelector('#form-price').value) || 0,
        quantity: parseInt(modalBackdrop.querySelector('#form-quantity').value, 10) || 0,
        minStock: parseInt(modalBackdrop.querySelector('#form-min-stock').value, 10) || 5,
        supplier: modalBackdrop.querySelector('#form-supplier').value.trim(),
        description: modalBackdrop.querySelector('#form-description').value.trim()
      };

      if (!payload.name) return;

      let success = false;
      if (state.modal.mode === 'edit') {
        success = await updateProduct(state.modal.currentId, payload);
      } else {
        success = await createProduct(payload);
      }

      if (success) {
        closeProductModal();
      }
    };
  }

  function openProductModal(mode = 'create', item = null) {
    state.modal.mode = mode;
    state.modal.currentId = item ? item.id : null;
    renderProductModal();
    requestAnimationFrame(() => {
      modalBackdrop.classList.add('open');
      document.getElementById('form-name').focus();
    });
  }

  function closeProductModal() {
    if (modalBackdrop) {
      modalBackdrop.classList.remove('open');
    }
  }

  let deleteModalBackdrop = null;

  function renderDeleteModal() {
    if (deleteModalBackdrop) deleteModalBackdrop.remove();

    deleteModalBackdrop = document.createElement('div');
    deleteModalBackdrop.className = 'modal-backdrop';
    deleteModalBackdrop.id = 'delete-modal';

    deleteModalBackdrop.innerHTML = `
      <div class="modal-content" style="max-width: 400px;">
        <div class="modal-header">
          <h3 style="color: var(--danger);">Eliminar Produto</h3>
          <button class="modal-close-btn" id="del-modal-close">&times;</button>
        </div>
        <div class="modal-body" style="padding: 20px 24px;">
          <p style="font-size: 15px; color: var(--dark);">
            Eliminar <strong id="del-product-name"></strong>?
          </p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" id="btn-cancel-del">Cancelar</button>
          <button class="btn" id="btn-confirm-del" style="background: var(--danger); color: var(--white);">
            Eliminar
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(deleteModalBackdrop);

    deleteModalBackdrop.querySelector('#del-modal-close').onclick = closeDeleteModal;
    deleteModalBackdrop.querySelector('#btn-cancel-del').onclick = closeDeleteModal;
    deleteModalBackdrop.onclick = (e) => {
      if (e.target === deleteModalBackdrop) closeDeleteModal();
    };

    deleteModalBackdrop.querySelector('#btn-confirm-del').onclick = async () => {
      if (state.deleteModal.targetId) {
        await deleteProduct(state.deleteModal.targetId);
        closeDeleteModal();
      }
    };
  }

  function openDeleteModal(id, name) {
    state.deleteModal.targetId = id;
    state.deleteModal.targetName = name;
    renderDeleteModal();
    document.getElementById('del-product-name').textContent = `"${name}"`;
    requestAnimationFrame(() => {
      deleteModalBackdrop.classList.add('open');
    });
  }

  function closeDeleteModal() {
    if (deleteModalBackdrop) {
      deleteModalBackdrop.classList.remove('open');
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function init() {
    injectStyles();
    loadData();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
