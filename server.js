const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const crypto = require('crypto');

const PORT = process.env.PORT || 3000;
// Suporte a caminhos dinâmicos quando embutido no Electron
const DATA_DIR  = process.env.INVENTARIO_DATA_DIR || path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'inventory.json');
const SEED_FILE = path.join(DATA_DIR, 'seed.json');
// public dir: resolve relativo ao ficheiro actual (funciona em .exe também)
const PUBLIC_DIR = path.join(__dirname, 'public');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Inicializa base de dados
function loadDatabase() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const data = JSON.parse(raw);
      if (data && data.brands && data.models && data.equipments) {
        return data;
      }
    }
  } catch (err) {
    console.error('Erro ao ler inventory.json, carregando seed:', err.message);
  }

  // Se não existir ou estiver em formato antigo, carrega de seed.json
  if (fs.existsSync(SEED_FILE)) {
    try {
      const seedRaw = fs.readFileSync(SEED_FILE, 'utf-8');
      const seedData = JSON.parse(seedRaw);
      saveDatabase(seedData);
      return seedData;
    } catch (e) {
      console.error('Erro ao ler seed.json:', e.message);
    }
  }

  // Fallback vazio seguro
  const emptyDb = {
    metadata: { systemName: "Gestor de Inventário TI", version: "2.0.0", updatedAt: new Date().toISOString() },
    brands: [],
    models: [],
    equipments: []
  };
  saveDatabase(emptyDb);
  return emptyDb;
}

function saveDatabase(db) {
  try {
    db.metadata = db.metadata || {};
    db.metadata.updatedAt = new Date().toISOString();
    db.metadata.totalBrands = db.brands ? db.brands.length : 0;
    db.metadata.totalModels = db.models ? db.models.length : 0;
    db.metadata.totalEquipments = db.equipments ? db.equipments.length : 0;
    fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Erro ao gravar inventory.json:', err.message);
    return false;
  }
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(data));
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 10 * 1024 * 1024) {
        reject(new Error('Payload demasiado grande'));
      }
    });
    req.on('end', () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        reject(new Error('JSON inválido'));
      }
    });
    req.on('error', reject);
  });
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon'
};

function serveStatic(req, res, pathname) {
  let relativePath = pathname === '/' ? 'index.html' : pathname;
  let filePath = path.join(PUBLIC_DIR, relativePath);

  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    return res.end();
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      const indexPath = path.join(PUBLIC_DIR, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        return fs.createReadStream(indexPath).pipe(res);
      }
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end();
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  });
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const { pathname, query } = parsedUrl;

  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    return res.end();
  }

  if (pathname.startsWith('/api/')) {
    try {
      const db = loadDatabase();

      // ==========================================
      // 1. BASE DE DADOS COMPLETA
      // ==========================================
      if (pathname === '/api/database' && req.method === 'GET') {
        return sendJson(res, 200, { success: true, data: db });
      }

      // ==========================================
      // 2. ESTATÍSTICAS DO INVENTÁRIO
      // ==========================================
      if (pathname === '/api/stats' && req.method === 'GET') {
        const equipments = db.equipments || [];
        const brands = db.brands || [];
        const models = db.models || [];

        let totalValue = 0;
        const byStatus = {
          "Em Uso": 0,
          "Disponível": 0,
          "Em Manutenção": 0,
          "Em Reserva": 0
        };

        const byBrand = {};
        brands.forEach(b => {
          byBrand[b.name] = {
            id: b.id,
            name: b.name,
            equipmentCount: 0,
            modelCount: 0,
            totalValue: 0
          };
        });

        models.forEach(m => {
          if (byBrand[m.brandName]) {
            byBrand[m.brandName].modelCount++;
          }
        });

        const byCategory = {};

        equipments.forEach(eq => {
          const val = Number(eq.value) || 0;
          totalValue += val;

          // Status
          const st = eq.status || 'Disponível';
          byStatus[st] = (byStatus[st] || 0) + 1;

          // Marca
          if (byBrand[eq.brandName]) {
            byBrand[eq.brandName].equipmentCount++;
            byBrand[eq.brandName].totalValue += val;
          }

          // Categoria
          const cat = eq.category || 'Outros';
          byCategory[cat] = (byCategory[cat] || 0) + 1;
        });

        return sendJson(res, 200, {
          success: true,
          stats: {
            totalBrands: brands.length,
            totalModels: models.length,
            totalEquipments: equipments.length,
            totalValue: Math.round(totalValue * 100) / 100,
            byStatus,
            byBrand: Object.values(byBrand),
            byCategory,
            updatedAt: db.metadata ? db.metadata.updatedAt : new Date().toISOString()
          }
        });
      }

      // ==========================================
      // 3. MARCAS (CRUD)
      // ==========================================
      if (pathname === '/api/brands' && req.method === 'GET') {
        const brandsWithCounts = (db.brands || []).map(b => {
          const modelCount = (db.models || []).filter(m => m.brandId === b.id).length;
          const equipmentCount = (db.equipments || []).filter(e => e.brandId === b.id).length;
          const totalValue = (db.equipments || [])
            .filter(e => e.brandId === b.id)
            .reduce((sum, e) => sum + (Number(e.value) || 0), 0);
          return {
            ...b,
            modelCount,
            equipmentCount,
            totalValue: Math.round(totalValue * 100) / 100
          };
        });
        return sendJson(res, 200, { success: true, count: brandsWithCounts.length, data: brandsWithCounts });
      }

      if (pathname === '/api/brands' && req.method === 'POST') {
        const body = await parseBody(req);
        if (!body.name || !body.name.trim()) {
          return sendJson(res, 400, { success: false, message: 'O nome da marca é obrigatório.' });
        }

        const trimmedName = body.name.trim();
        if (db.brands.some(b => b.name.toLowerCase() === trimmedName.toLowerCase())) {
          return sendJson(res, 400, { success: false, message: 'Já existe uma marca com este nome.' });
        }

        const newBrand = {
          id: `brand-${Date.now()}`,
          code: (body.code && body.code.trim().toUpperCase()) || trimmedName.slice(0, 4).toUpperCase(),
          name: trimmedName,
          country: body.country ? body.country.trim() : 'Internacional',
          category: body.category ? body.category.trim() : 'Geral',
          website: body.website ? body.website.trim() : '',
          contact: body.contact ? body.contact.trim() : '',
          description: body.description ? body.description.trim() : ''
        };

        db.brands.push(newBrand);
        saveDatabase(db);
        return sendJson(res, 201, { success: true, data: newBrand });
      }

      const brandMatch = pathname.match(/^\/api\/brands\/([^\/]+)$/);
      if (brandMatch && req.method === 'PUT') {
        const id = brandMatch[1];
        const body = await parseBody(req);
        const index = db.brands.findIndex(b => b.id === id);

        if (index === -1) {
          return sendJson(res, 404, { success: false, message: 'Marca não encontrada.' });
        }

        const oldName = db.brands[index].name;
        const newName = body.name ? body.name.trim() : oldName;

        db.brands[index] = {
          ...db.brands[index],
          name: newName,
          code: body.code ? body.code.trim().toUpperCase() : db.brands[index].code,
          country: body.country !== undefined ? body.country.trim() : db.brands[index].country,
          category: body.category !== undefined ? body.category.trim() : db.brands[index].category,
          website: body.website !== undefined ? body.website.trim() : db.brands[index].website,
          contact: body.contact !== undefined ? body.contact.trim() : db.brands[index].contact,
          description: body.description !== undefined ? body.description.trim() : db.brands[index].description
        };

        // Atualiza referências caso o nome tenha mudado
        if (oldName !== newName) {
          db.models.forEach(m => {
            if (m.brandId === id) m.brandName = newName;
          });
          db.equipments.forEach(e => {
            if (e.brandId === id) e.brandName = newName;
          });
        }

        saveDatabase(db);
        return sendJson(res, 200, { success: true, data: db.brands[index] });
      }

      if (brandMatch && req.method === 'DELETE') {
        const id = brandMatch[1];
        const hasModels = db.models.some(m => m.brandId === id);
        const hasEquipments = db.equipments.some(e => e.brandId === id);

        if (hasModels || hasEquipments) {
          return sendJson(res, 400, {
            success: false,
            message: 'Não é possível eliminar a marca porque existem modelos ou equipamentos associados.'
          });
        }

        db.brands = db.brands.filter(b => b.id !== id);
        saveDatabase(db);
        return sendJson(res, 200, { success: true, message: 'Marca eliminada com sucesso.' });
      }

      // ==========================================
      // 4. MODELOS (CRUD)
      // ==========================================
      if (pathname === '/api/models' && req.method === 'GET') {
        let list = [...(db.models || [])];

        if (query.brandId) {
          list = list.filter(m => m.brandId === query.brandId);
        }
        if (query.category) {
          list = list.filter(m => m.category.toLowerCase() === query.category.toLowerCase());
        }
        if (query.search) {
          const s = query.search.toLowerCase().trim();
          list = list.filter(m =>
            m.name.toLowerCase().includes(s) ||
            m.brandName.toLowerCase().includes(s) ||
            (m.specs && m.specs.toLowerCase().includes(s))
          );
        }

        const modelsWithStats = list.map(m => {
          const totalUnits = db.equipments.filter(e => e.modelId === m.id).length;
          const activeUnits = db.equipments.filter(e => e.modelId === m.id && e.status === 'Em Uso').length;
          const availableUnits = db.equipments.filter(e => e.modelId === m.id && e.status === 'Disponível').length;
          return {
            ...m,
            totalUnits,
            activeUnits,
            availableUnits
          };
        });

        return sendJson(res, 200, { success: true, count: modelsWithStats.length, data: modelsWithStats });
      }

      if (pathname === '/api/models' && req.method === 'POST') {
        const body = await parseBody(req);
        if (!body.name || !body.name.trim()) {
          return sendJson(res, 400, { success: false, message: 'Nome do modelo é obrigatório.' });
        }
        if (!body.brandId) {
          return sendJson(res, 400, { success: false, message: 'Marca associada é obrigatória.' });
        }

        const brand = db.brands.find(b => b.id === body.brandId);
        if (!brand) {
          return sendJson(res, 404, { success: false, message: 'Marca não encontrada.' });
        }

        const newModel = {
          id: `mod-${Date.now()}`,
          brandId: brand.id,
          brandName: brand.name,
          name: body.name.trim(),
          category: body.category ? body.category.trim() : 'Portáteis',
          type: body.type ? body.type.trim() : 'Equipamento',
          specs: body.specs ? body.specs.trim() : '',
          basePrice: Math.max(0, parseFloat(body.basePrice) || 0)
        };

        db.models.push(newModel);
        saveDatabase(db);
        return sendJson(res, 201, { success: true, data: newModel });
      }

      const modelMatch = pathname.match(/^\/api\/models\/([^\/]+)$/);
      if (modelMatch && req.method === 'PUT') {
        const id = modelMatch[1];
        const body = await parseBody(req);
        const index = db.models.findIndex(m => m.id === id);

        if (index === -1) {
          return sendJson(res, 404, { success: false, message: 'Modelo não encontrado.' });
        }

        let brandName = db.models[index].brandName;
        let brandId = db.models[index].brandId;

        if (body.brandId && body.brandId !== brandId) {
          const brand = db.brands.find(b => b.id === body.brandId);
          if (brand) {
            brandId = brand.id;
            brandName = brand.name;
          }
        }

        const oldName = db.models[index].name;
        const newName = body.name ? body.name.trim() : oldName;

        db.models[index] = {
          ...db.models[index],
          brandId,
          brandName,
          name: newName,
          category: body.category !== undefined ? body.category.trim() : db.models[index].category,
          type: body.type !== undefined ? body.type.trim() : db.models[index].type,
          specs: body.specs !== undefined ? body.specs.trim() : db.models[index].specs,
          basePrice: body.basePrice !== undefined ? Math.max(0, parseFloat(body.basePrice) || 0) : db.models[index].basePrice
        };

        // Atualiza referências nos equipamentos
        db.equipments.forEach(e => {
          if (e.modelId === id) {
            e.modelName = newName;
            e.brandId = brandId;
            e.brandName = brandName;
            if (body.category) e.category = body.category.trim();
          }
        });

        saveDatabase(db);
        return sendJson(res, 200, { success: true, data: db.models[index] });
      }

      if (modelMatch && req.method === 'DELETE') {
        const id = modelMatch[1];
        const hasEquipments = db.equipments.some(e => e.modelId === id);

        if (hasEquipments) {
          return sendJson(res, 400, {
            success: false,
            message: 'Não é possível eliminar o modelo porque existem equipamentos registados com ele.'
          });
        }

        db.models = db.models.filter(m => m.id !== id);
        saveDatabase(db);
        return sendJson(res, 200, { success: true, message: 'Modelo eliminado com sucesso.' });
      }

      // ==========================================
      // 5. EQUIPAMENTOS (CRUD + FILTROS)
      // ==========================================
      if (pathname === '/api/equipments' && req.method === 'GET') {
        let items = [...(db.equipments || [])];

        // Pesquisa global
        if (query.search) {
          const s = query.search.toLowerCase().trim();
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

        // Filtro Marca
        if (query.brandId && query.brandId !== 'all') {
          items = items.filter(e => e.brandId === query.brandId);
        }

        // Filtro Modelo
        if (query.modelId && query.modelId !== 'all') {
          items = items.filter(e => e.modelId === query.modelId);
        }

        // Filtro Categoria
        if (query.category && query.category !== 'all') {
          items = items.filter(e => e.category === query.category);
        }

        // Filtro Estado
        if (query.status && query.status !== 'all') {
          items = items.filter(e => e.status === query.status);
        }

        // Ordenação
        const sortBy = query.sortBy || 'assetTag';
        const sortOrder = query.sortOrder === 'desc' ? -1 : 1;

        items.sort((a, b) => {
          let valA = a[sortBy];
          let valB = b[sortBy];

          if (sortBy === 'value') {
            return (Number(valA || 0) - Number(valB || 0)) * sortOrder;
          }
          if (sortBy === 'acquisitionDate' || sortBy === 'updatedAt') {
            return (new Date(valA || 0).getTime() - new Date(valB || 0).getTime()) * sortOrder;
          }
          return String(valA || '').localeCompare(String(valB || ''), 'pt', { sensitivity: 'base' }) * sortOrder;
        });

        const totalFiltered = items.length;

        // Paginação opcional
        if (query.limit) {
          const limit = parseInt(query.limit, 10);
          const offset = parseInt(query.offset || '0', 10);
          items = items.slice(offset, offset + limit);
        }

        return sendJson(res, 200, {
          success: true,
          total: totalFiltered,
          count: items.length,
          data: items
        });
      }

      if (pathname === '/api/equipments' && req.method === 'POST') {
        const body = await parseBody(req);

        if (!body.modelId) {
          return sendJson(res, 400, { success: false, message: 'Modelo é obrigatório.' });
        }

        const model = db.models.find(m => m.id === body.modelId);
        if (!model) {
          return sendJson(res, 404, { success: false, message: 'Modelo não encontrado.' });
        }

        const brand = db.brands.find(b => b.id === model.brandId);

        // Gera tag de património única se não fornecida
        let assetTag = body.assetTag ? body.assetTag.trim().toUpperCase() : '';
        if (!assetTag) {
          const maxNum = db.equipments.reduce((max, e) => {
            const m = e.assetTag && e.assetTag.match(/PAT-(\d+)/);
            return m ? Math.max(max, parseInt(m[1], 10)) : max;
          }, 0);
          assetTag = `PAT-${String(maxNum + 1).padStart(4, '0')}`;
        }

        // Verifica unicidade
        if (db.equipments.some(e => e.assetTag.toLowerCase() === assetTag.toLowerCase())) {
          return sendJson(res, 400, { success: false, message: `Etiqueta de património '${assetTag}' já está em uso.` });
        }

        // N.º de Série
        let serialNumber = body.serialNumber ? body.serialNumber.trim().toUpperCase() : '';
        if (!serialNumber) {
          const rand = Math.floor(1000 + Math.random() * 9000);
          serialNumber = `SN-${brand ? brand.code : 'GEN'}-${Date.now().toString().slice(-4)}-${rand}`;
        }

        const newEquipment = {
          id: `eq-${Date.now()}`,
          assetTag,
          serialNumber,
          brandId: model.brandId,
          brandName: model.brandName,
          modelId: model.id,
          modelName: model.name,
          category: model.category,
          specs: model.specs,
          status: body.status || 'Disponível',
          assignedTo: body.assignedTo ? body.assignedTo.trim() : (body.status === 'Disponível' ? 'Não Atribuído' : ''),
          location: body.location ? body.location.trim() : 'Armazém Central',
          acquisitionDate: body.acquisitionDate || new Date().toISOString().split('T')[0],
          value: body.value !== undefined ? Math.max(0, parseFloat(body.value) || 0) : model.basePrice,
          notes: body.notes ? body.notes.trim() : '',
          updatedAt: new Date().toISOString()
        };

        db.equipments.unshift(newEquipment);
        saveDatabase(db);

        return sendJson(res, 201, { success: true, data: newEquipment });
      }

      // Detalhes de um equipamento
      const eqSingleMatch = pathname.match(/^\/api\/equipments\/([^\/]+)$/);
      if (eqSingleMatch && req.method === 'GET') {
        const id = eqSingleMatch[1];
        const item = db.equipments.find(e => e.id === id);
        if (!item) {
          return sendJson(res, 404, { success: false, message: 'Equipamento não encontrado.' });
        }
        return sendJson(res, 200, { success: true, data: item });
      }

      if (eqSingleMatch && req.method === 'PUT') {
        const id = eqSingleMatch[1];
        const body = await parseBody(req);
        const index = db.equipments.findIndex(e => e.id === id);

        if (index === -1) {
          return sendJson(res, 404, { success: false, message: 'Equipamento não encontrado.' });
        }

        const existing = db.equipments[index];

        // Se mudou de modelo
        let model = db.models.find(m => m.id === (body.modelId || existing.modelId));
        let modelId = existing.modelId;
        let modelName = existing.modelName;
        let brandId = existing.brandId;
        let brandName = existing.brandName;
        let category = existing.category;
        let specs = existing.specs;

        if (model && model.id !== existing.modelId) {
          modelId = model.id;
          modelName = model.name;
          brandId = model.brandId;
          brandName = model.brandName;
          category = model.category;
          specs = model.specs;
        }

        // Validar unicidade da etiqueta de património
        if (body.assetTag && body.assetTag.trim().toLowerCase() !== existing.assetTag.toLowerCase()) {
          const duplicate = db.equipments.find(e => e.id !== id && e.assetTag.toLowerCase() === body.assetTag.trim().toLowerCase());
          if (duplicate) {
            return sendJson(res, 400, { success: false, message: 'Etiqueta de património já atribuída a outro equipamento.' });
          }
        }

        const updated = {
          ...existing,
          assetTag: body.assetTag !== undefined ? body.assetTag.trim().toUpperCase() : existing.assetTag,
          serialNumber: body.serialNumber !== undefined ? body.serialNumber.trim().toUpperCase() : existing.serialNumber,
          modelId,
          modelName,
          brandId,
          brandName,
          category: body.category !== undefined ? body.category.trim() : category,
          specs: body.specs !== undefined ? body.specs.trim() : specs,
          status: body.status !== undefined ? body.status : existing.status,
          assignedTo: body.assignedTo !== undefined ? body.assignedTo.trim() : existing.assignedTo,
          location: body.location !== undefined ? body.location.trim() : existing.location,
          acquisitionDate: body.acquisitionDate !== undefined ? body.acquisitionDate : existing.acquisitionDate,
          value: body.value !== undefined ? Math.max(0, parseFloat(body.value) || 0) : existing.value,
          notes: body.notes !== undefined ? body.notes.trim() : existing.notes,
          updatedAt: new Date().toISOString()
        };

        db.equipments[index] = updated;
        saveDatabase(db);
        return sendJson(res, 200, { success: true, data: updated });
      }

      if (eqSingleMatch && req.method === 'DELETE') {
        const id = eqSingleMatch[1];
        const beforeCount = db.equipments.length;
        db.equipments = db.equipments.filter(e => e.id !== id);

        if (db.equipments.length === beforeCount) {
          return sendJson(res, 404, { success: false, message: 'Equipamento não encontrado.' });
        }

        saveDatabase(db);
        return sendJson(res, 200, { success: true, message: 'Equipamento eliminado com sucesso.' });
      }

      // Mudança rápida de estado
      const eqStatusMatch = pathname.match(/^\/api\/equipments\/([^\/]+)\/status$/);
      if (eqStatusMatch && req.method === 'POST') {
        const id = eqStatusMatch[1];
        const body = await parseBody(req);
        const item = db.equipments.find(e => e.id === id);

        if (!item) {
          return sendJson(res, 404, { success: false, message: 'Equipamento não encontrado.' });
        }

        item.status = body.status || item.status;
        if (body.assignedTo !== undefined) item.assignedTo = body.assignedTo;
        if (body.location !== undefined) item.location = body.location;
        item.updatedAt = new Date().toISOString();

        saveDatabase(db);
        return sendJson(res, 200, { success: true, data: item });
      }

      // ==========================================
      // 6. BACKUP, EXPORTAÇÃO, IMPORTAÇÃO E RESET
      // ==========================================
      if (pathname === '/api/reset' && req.method === 'POST') {
        if (!fs.existsSync(SEED_FILE)) {
          return sendJson(res, 500, { success: false, message: 'Ficheiro seed original não encontrado.' });
        }
        const raw = fs.readFileSync(SEED_FILE, 'utf-8');
        const seedData = JSON.parse(raw);
        saveDatabase(seedData);
        return sendJson(res, 200, {
          success: true,
          message: 'Inventário restaurado para o estado inicial de 200 equipamentos (5 Marcas, 50 Modelos).',
          data: seedData
        });
      }

      if (pathname === '/api/export' && req.method === 'GET') {
        res.writeHead(200, {
          'Content-Type': 'application/json; charset=utf-8',
          'Content-Disposition': `attachment; filename="inventario-backup-${new Date().toISOString().slice(0, 10)}.json"`
        });
        return res.end(JSON.stringify(db, null, 2));
      }

      if (pathname === '/api/import' && req.method === 'POST') {
        const body = await parseBody(req);
        if (!body.brands || !body.models || !body.equipments) {
          return sendJson(res, 400, { success: false, message: 'Estrutura JSON inválida. Requer marcas, modelos e equipamentos.' });
        }
        saveDatabase(body);
        return sendJson(res, 200, { success: true, message: 'Dados importados com sucesso.' });
      }

      return sendJson(res, 404, { success: false, message: 'Endpoint de API não encontrado.' });
    } catch (err) {
      console.error('Erro na API:', err);
      return sendJson(res, 500, { success: false, message: 'Erro interno do servidor: ' + err.message });
    }
  }

  // Arquivos estáticos
  serveStatic(req, res, pathname);
});

function startServer(portToTry) {
  server.listen(portToTry, '127.0.0.1', () => {
    console.log(`Servidor de Inventário TI ativo em: http://localhost:${portToTry}`);
    try {
      fs.writeFileSync(path.join(__dirname, '.port'), String(portToTry), 'utf-8');
    } catch (e) {}
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Porta ${portToTry} ocupada, tentando ${portToTry + 1}...`);
      startServer(portToTry + 1);
    } else {
      console.error('Erro de servidor:', err);
    }
  });
}

module.exports = { server, loadDatabase, saveDatabase };

if (require.main === module) {
  startServer(Number(PORT));
}
