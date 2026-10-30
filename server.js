const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const crypto = require('crypto');

const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'inventory.json');
const PUBLIC_DIR = path.join(__dirname, 'public');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DEFAULT_ITEMS = [
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
  },
  {
    id: "prod-4",
    name: "Monitor UltraWide 29\" 75Hz",
    sku: "TECH-004",
    category: "Informática",
    price: 249.00,
    quantity: 8,
    minStock: 3,
    supplier: "DisplayTech",
    description: "Monitor IPS UltraWide 21:9 com suporte HDR e FreeSync.",
    updatedAt: new Date().toISOString()
  },
  {
    id: "prod-5",
    name: "Cadeira de Escritório Ergonómica",
    sku: "MOB-005",
    category: "Mobiliário",
    price: 185.00,
    quantity: 3,
    minStock: 5,
    supplier: "Mobiliário & Conforto",
    description: "Cadeira giratória com suporte lombar ajustável e malha respirável.",
    updatedAt: new Date().toISOString()
  },
  {
    id: "prod-6",
    name: "Hub USB-C 7 em 1 4K",
    sku: "ACC-006",
    category: "Acessórios",
    price: 42.00,
    quantity: 25,
    minStock: 8,
    supplier: "Global Peripherals",
    description: "Hub multifuncional com HDMI 4K, 3x USB 3.0, leitor SD e PD 100W.",
    updatedAt: new Date().toISOString()
  },
  {
    id: "prod-7",
    name: "Auriculares Bluetooth ANC",
    sku: "AUD-007",
    category: "Áudio",
    price: 119.90,
    quantity: 0,
    minStock: 4,
    supplier: "SoundMasters",
    description: "Auriculares sem fios com cancelamento ativo de ruído até 35dB.",
    updatedAt: new Date().toISOString()
  },
  {
    id: "prod-8",
    name: "Microfone USB Condensador",
    sku: "AUD-008",
    category: "Áudio",
    price: 64.99,
    quantity: 12,
    minStock: 4,
    supplier: "SoundMasters",
    description: "Microfone de estúdio cardioide para reuniões, streaming e podcasts.",
    updatedAt: new Date().toISOString()
  }
];

function readInventory() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      writeInventory(DEFAULT_ITEMS);
      return DEFAULT_ITEMS;
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    return [];
  }
}

function writeInventory(items) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(items, null, 2), 'utf-8');
    return true;
  } catch (err) {
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
      if (body.length > 5 * 1024 * 1024) {
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
      if (pathname === '/api/products' && req.method === 'GET') {
        let items = readInventory();

        if (query.search) {
          const s = query.search.toLowerCase().trim();
          items = items.filter(i =>
            (i.name && i.name.toLowerCase().includes(s)) ||
            (i.sku && i.sku.toLowerCase().includes(s)) ||
            (i.supplier && i.supplier.toLowerCase().includes(s)) ||
            (i.description && i.description.toLowerCase().includes(s))
          );
        }

        if (query.category && query.category !== 'all') {
          items = items.filter(i => i.category === query.category);
        }

        if (query.status) {
          if (query.status === 'outOfStock') {
            items = items.filter(i => Number(i.quantity) === 0);
          } else if (query.status === 'lowStock') {
            items = items.filter(i => Number(i.quantity) > 0 && Number(i.quantity) <= Number(i.minStock || 5));
          } else if (query.status === 'inStock') {
            items = items.filter(i => Number(i.quantity) > Number(i.minStock || 5));
          }
        }

        const sortBy = query.sortBy || 'name';
        const sortOrder = query.sortOrder === 'desc' ? -1 : 1;

        items.sort((a, b) => {
          let valA = a[sortBy];
          let valB = b[sortBy];

          if (sortBy === 'price' || sortBy === 'quantity' || sortBy === 'minStock') {
            return (Number(valA) - Number(valB)) * sortOrder;
          }
          if (sortBy === 'updatedAt') {
            return (new Date(valA).getTime() - new Date(valB).getTime()) * sortOrder;
          }
          return String(valA || '').localeCompare(String(valB || ''), 'pt', { sensitivity: 'base' }) * sortOrder;
        });

        return sendJson(res, 200, { success: true, count: items.length, data: items });
      }

      if (pathname === '/api/stats' && req.method === 'GET') {
        const items = readInventory();
        let totalQuantity = 0;
        let totalValue = 0;
        let outOfStock = 0;
        let lowStock = 0;
        const categories = {};

        items.forEach(item => {
          const q = Number(item.quantity) || 0;
          const p = Number(item.price) || 0;
          const min = Number(item.minStock) || 5;

          totalQuantity += q;
          totalValue += q * p;

          if (q === 0) {
            outOfStock++;
          } else if (q <= min) {
            lowStock++;
          }

          const cat = item.category || 'Geral';
          categories[cat] = (categories[cat] || 0) + 1;
        });

        return sendJson(res, 200, {
          success: true,
          stats: {
            totalProducts: items.length,
            totalQuantity,
            totalValue: Math.round(totalValue * 100) / 100,
            outOfStock,
            lowStock,
            categories
          }
        });
      }

      if (pathname === '/api/products' && req.method === 'POST') {
        const body = await parseBody(req);

        if (!body.name || !body.name.trim()) {
          return sendJson(res, 400, { success: false, message: 'Nome obrigatório' });
        }

        const items = readInventory();
        const sku = (body.sku && body.sku.trim()) || `SKU-${Date.now().toString().slice(-6)}`;

        if (items.some(i => i.sku.toLowerCase() === sku.toLowerCase())) {
          return sendJson(res, 400, { success: false, message: 'SKU duplicado' });
        }

        const newItem = {
          id: `prod-${crypto.randomUUID ? crypto.randomUUID().slice(0, 8) : Date.now()}`,
          name: body.name.trim(),
          sku: sku.toUpperCase(),
          category: body.category && body.category.trim() ? body.category.trim() : 'Geral',
          price: Math.max(0, parseFloat(body.price) || 0),
          quantity: Math.max(0, parseInt(body.quantity, 10) || 0),
          minStock: Math.max(0, parseInt(body.minStock, 10) || 5),
          supplier: body.supplier ? body.supplier.trim() : '',
          description: body.description ? body.description.trim() : '',
          updatedAt: new Date().toISOString()
        };

        items.unshift(newItem);
        writeInventory(items);

        return sendJson(res, 201, { success: true, data: newItem });
      }

      const updateMatch = pathname.match(/^\/api\/products\/([^\/]+)$/);
      if (updateMatch && req.method === 'PUT') {
        const id = updateMatch[1];
        const body = await parseBody(req);
        const items = readInventory();
        const index = items.findIndex(i => i.id === id);

        if (index === -1) {
          return sendJson(res, 404, { success: false });
        }

        if (body.sku) {
          const duplicate = items.find(i => i.id !== id && i.sku.toLowerCase() === body.sku.trim().toLowerCase());
          if (duplicate) {
            return sendJson(res, 400, { success: false, message: 'SKU duplicado' });
          }
        }

        const existing = items[index];
        const updated = {
          ...existing,
          name: body.name !== undefined ? body.name.trim() : existing.name,
          sku: body.sku !== undefined ? body.sku.trim().toUpperCase() : existing.sku,
          category: body.category !== undefined ? body.category.trim() : existing.category,
          price: body.price !== undefined ? Math.max(0, parseFloat(body.price) || 0) : existing.price,
          quantity: body.quantity !== undefined ? Math.max(0, parseInt(body.quantity, 10) || 0) : existing.quantity,
          minStock: body.minStock !== undefined ? Math.max(0, parseInt(body.minStock, 10) || 0) : existing.minStock,
          supplier: body.supplier !== undefined ? body.supplier.trim() : existing.supplier,
          description: body.description !== undefined ? body.description.trim() : existing.description,
          updatedAt: new Date().toISOString()
        };

        items[index] = updated;
        writeInventory(items);

        return sendJson(res, 200, { success: true, data: updated });
      }

      const deleteMatch = pathname.match(/^\/api\/products\/([^\/]+)$/);
      if (deleteMatch && req.method === 'DELETE') {
        const id = deleteMatch[1];
        let items = readInventory();
        const beforeCount = items.length;
        items = items.filter(i => i.id !== id);

        if (items.length === beforeCount) {
          return sendJson(res, 404, { success: false });
        }

        writeInventory(items);
        return sendJson(res, 200, { success: true });
      }

      const adjustMatch = pathname.match(/^\/api\/products\/([^\/]+)\/adjust$/);
      if (adjustMatch && req.method === 'POST') {
        const id = adjustMatch[1];
        const body = await parseBody(req);
        const delta = parseInt(body.delta, 10) || 0;
        const items = readInventory();
        const item = items.find(i => i.id === id);

        if (!item) {
          return sendJson(res, 404, { success: false });
        }

        item.quantity = Math.max(0, item.quantity + delta);
        item.updatedAt = new Date().toISOString();
        writeInventory(items);

        return sendJson(res, 200, { success: true, data: item });
      }

      if (pathname === '/api/reset' && req.method === 'POST') {
        writeInventory(DEFAULT_ITEMS);
        return sendJson(res, 200, { success: true, data: DEFAULT_ITEMS });
      }

      return sendJson(res, 404, { success: false });
    } catch (err) {
      return sendJson(res, 500, { success: false });
    }
  }

  serveStatic(req, res, pathname);
});

server.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});
