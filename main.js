'use strict';

const { app, BrowserWindow, Menu, dialog, ipcMain, shell } = require('electron');
const path = require('path');
const fs   = require('fs');
const http = require('http');

// ─── Caminhos principais ──────────────────────────────────────────────────────
const IS_DEV  = process.argv.includes('--dev');
const BASE_DIR = app.isPackaged
  ? path.dirname(process.execPath)
  : __dirname;

const DATA_DIR  = path.join(BASE_DIR, 'data');
const DATA_FILE = path.join(DATA_DIR, 'inventory.json');
const SEED_FILE = path.join(DATA_DIR, 'seed.json');

let mainWindow  = null;
let httpServer  = null;
let serverPort  = null;

// ─── Garante estrutura de dados ───────────────────────────────────────────────
function ensureData() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

  if (!fs.existsSync(DATA_FILE) && fs.existsSync(SEED_FILE)) {
    fs.copyFileSync(SEED_FILE, DATA_FILE);
    console.log('[Dados] inventory.json copiado do seed.json');
  }

  if (!fs.existsSync(DATA_FILE)) {
    const empty = { metadata: { version: '2.0.0' }, brands: [], models: [], equipments: [] };
    fs.writeFileSync(DATA_FILE, JSON.stringify(empty, null, 2));
  }
}

// ─── Inicia o servidor HTTP embutido numa porta livre ─────────────────────────
function startServer() {
  return new Promise((resolve, reject) => {
    // Injeta o caminho dos dados para o server.js
    process.env.INVENTARIO_DATA_DIR = DATA_DIR;
    process.env.PORT = '0'; // pede porta dinâmica

    let serverMod;
    try {
      serverMod = require('./server.js');
    } catch (err) {
      return reject(new Error('Não foi possível carregar server.js: ' + err.message));
    }

    httpServer = serverMod.server;

    if (!httpServer) {
      return reject(new Error('server.js não exportou o objecto http.Server.'));
    }

    if (httpServer.listening) {
      serverPort = httpServer.address().port;
      console.log(`[Servidor] Já está activo na porta ${serverPort}`);
      return resolve(serverPort);
    }

    httpServer.listen(0, '127.0.0.1', () => {
      serverPort = httpServer.address().port;
      console.log(`[Servidor] Activo na porta dinâmica: ${serverPort}`);
      resolve(serverPort);
    });

    httpServer.on('error', reject);
  });
}

// ─── Cria a janela principal Electron ─────────────────────────────────────────
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 680,
    title: 'Gestor de Inventário TI',
    icon: path.join(__dirname, 'assets', 'icon.ico'),
    backgroundColor: '#0f172a',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      spellcheck: false,
      devTools: IS_DEV,
    },
    autoHideMenuBar: false,
  });

  mainWindow.loadURL(`http://127.0.0.1:${serverPort}`);

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    if (IS_DEV) mainWindow.webContents.openDevTools({ mode: 'detach' });
  });

  mainWindow.webContents.on('did-fail-load', (_e, code, desc, url) => {
    console.error(`[Window] Falhou ao carregar ${url} — ${code}: ${desc}`);
    // Tenta recarregar após 1 segundo (servidor pode não estar pronto)
    setTimeout(() => mainWindow && mainWindow.loadURL(`http://127.0.0.1:${serverPort}`), 1000);
  });

  mainWindow.on('closed', () => { mainWindow = null; });

  buildMenu();
}

// ─── Menu nativo da aplicação ─────────────────────────────────────────────────
function buildMenu() {
  const send = (ch, ...args) => mainWindow && mainWindow.webContents.send(ch, ...args);

  const template = [
    {
      label: 'Inventário',
      submenu: [
        { label: 'Atualizar (F5)', accelerator: 'F5',
          click: () => mainWindow && mainWindow.webContents.reload() },
        { type: 'separator' },
        {
          label: 'Exportar para CSV (Excel)...',
          accelerator: 'CmdOrCtrl+E',
          click: async () => {
            const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
              title: 'Guardar inventário como CSV',
              defaultPath: `inventario-${today()}.csv`,
              filters: [{ name: 'CSV (Excel)', extensions: ['csv'] }]
            });
            if (!canceled && filePath) send('export-csv-to-path', filePath);
          }
        },
        {
          label: 'Exportar Backup JSON...',
          accelerator: 'CmdOrCtrl+Shift+S',
          click: async () => {
            const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
              title: 'Guardar backup completo',
              defaultPath: `backup-inventario-${today()}.json`,
              filters: [{ name: 'JSON', extensions: ['json'] }]
            });
            if (!canceled && filePath) send('export-json-to-path', filePath);
          }
        },
        {
          label: 'Importar Backup JSON...',
          accelerator: 'CmdOrCtrl+O',
          click: async () => {
            const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
              title: 'Importar base de dados',
              filters: [{ name: 'JSON', extensions: ['json'] }],
              properties: ['openFile']
            });
            if (!canceled && filePaths.length) send('import-json-from-path', filePaths[0]);
          }
        },
        { type: 'separator' },
        { label: 'Sair', accelerator: 'Alt+F4', role: 'quit' }
      ]
    },
    {
      label: 'Vista',
      submenu: [
        { label: 'Painel Geral',    accelerator: 'CmdOrCtrl+1', click: () => send('navigate', 'dashboard')   },
        { label: 'Equipamentos',    accelerator: 'CmdOrCtrl+2', click: () => send('navigate', 'equipments')  },
        { label: 'Modelos',         accelerator: 'CmdOrCtrl+3', click: () => send('navigate', 'models')      },
        { label: 'Marcas',         accelerator: 'CmdOrCtrl+4', click: () => send('navigate', 'brands')      },
        { label: 'Dados e Backup', accelerator: 'CmdOrCtrl+5', click: () => send('navigate', 'settings')   },
        { type: 'separator' },
        { label: 'Aumentar Zoom',  accelerator: 'CmdOrCtrl+numadd', role: 'zoomIn'       },
        { label: 'Diminuir Zoom',  accelerator: 'CmdOrCtrl+numsub', role: 'zoomOut'      },
        { label: 'Zoom Normal',    accelerator: 'CmdOrCtrl+0',      role: 'resetZoom'    },
        { type: 'separator' },
        { label: 'Ecrã Inteiro',   accelerator: 'F11', role: 'togglefullscreen' },
      ]
    },
    {
      label: 'Ferramentas',
      submenu: [
        {
          label: 'Restaurar 200 Equipamentos de Fábrica',
          click: async () => {
            const { response } = await dialog.showMessageBox(mainWindow, {
              type:    'warning',
              title:   'Restaurar Inventário',
              message: 'Deseja restaurar os 200 equipamentos originais?',
              detail:  'Todas as alterações serão perdidas. O inventário voltará ao estado inicial com 5 Marcas, 50 Modelos e 200 Equipamentos.',
              buttons: ['Cancelar', 'Restaurar'],
              defaultId: 0, cancelId: 0
            });
            if (response === 1) send('reset-database');
          }
        },
        {
          label: 'Abrir Pasta dos Dados',
          click: () => shell.openPath(DATA_DIR)
        },
        { type: 'separator' },
        ...(IS_DEV ? [{
          label: 'Ferramentas de Desenvolvimento',
          accelerator: 'F12',
          click: () => mainWindow && mainWindow.webContents.toggleDevTools()
        }] : [])
      ]
    },
    {
      label: 'Editar',
      submenu: [
        { label: 'Copiar',         accelerator: 'CmdOrCtrl+C', role: 'copy'      },
        { label: 'Colar',          accelerator: 'CmdOrCtrl+V', role: 'paste'     },
        { label: 'Selecionar Tudo', accelerator: 'CmdOrCtrl+A', role: 'selectAll' },
      ]
    },
    {
      label: 'Ajuda',
      submenu: [
        {
          label: 'Acerca da Aplicação',
          click: () => dialog.showMessageBox(mainWindow, {
            type:    'info',
            title:   'Gestor de Inventário TI',
            message: 'Gestor de Inventário TI — v2.0',
            detail:  '5 Marcas | 50 Modelos | 200 Equipamentos\n\nAplicação desktop nativa construída com Node.js + Electron.\nDados gravados localmente em: ' + DATA_DIR
          })
        }
      ]
    }
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

// ─── Handlers IPC ─────────────────────────────────────────────────────────────
ipcMain.handle('save-file', async (_e, { filePath, content }) => {
  try {
    fs.writeFileSync(filePath, content, 'utf-8');
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('read-file', async (_e, { filePath }) => {
  try {
    return { success: true, content: fs.readFileSync(filePath, 'utf-8') };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('get-data-path',     () => DATA_DIR);
ipcMain.handle('show-save-dialog',  (_e, opts) => dialog.showSaveDialog(mainWindow, opts));
ipcMain.handle('show-open-dialog',  (_e, opts) => dialog.showOpenDialog(mainWindow, opts));

// ─── Helpers ─────────────────────────────────────────────────────────────────
function today() { return new Date().toISOString().slice(0, 10); }

// ─── Arranque ─────────────────────────────────────────────────────────────────
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady().then(async () => {
    ensureData();

    try {
      await startServer();
    } catch (err) {
      await dialog.showErrorBox('Erro ao iniciar o servidor',
        'Não foi possível iniciar o motor da aplicação.\n\n' + err.message);
      app.quit();
      return;
    }

    createWindow();
  });

  app.on('window-all-closed', () => {
    if (httpServer && httpServer.listening) httpServer.close();
    app.quit();
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0 && serverPort) createWindow();
  });
}
