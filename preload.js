'use strict';

const { contextBridge, ipcRenderer } = require('electron');

// Expõe API segura para o renderer (página HTML) comunicar com o processo main
contextBridge.exposeInMainWorld('electronAPI', {
  // Navegação via menu nativo
  onNavigate: (callback) => ipcRenderer.on('navigate', (_event, tab) => callback(tab)),
  onExportCsvToPath: (callback) => ipcRenderer.on('export-csv-to-path', (_event, filePath) => callback(filePath)),
  onExportJsonToPath: (callback) => ipcRenderer.on('export-json-to-path', (_event, filePath) => callback(filePath)),
  onImportJsonFromPath: (callback) => ipcRenderer.on('import-json-from-path', (_event, filePath) => callback(filePath)),
  onResetDatabase: (callback) => ipcRenderer.on('reset-database', (_event) => callback()),

  // Operações com ficheiros
  saveFile: (filePath, content) => ipcRenderer.invoke('save-file', { filePath, content }),
  readFile: (filePath) => ipcRenderer.invoke('read-file', { filePath }),
  getDataPath: () => ipcRenderer.invoke('get-data-path'),

  // Diálogos nativos do sistema operativo
  showSaveDialog: (options) => ipcRenderer.invoke('show-save-dialog', options),
  showOpenDialog: (options) => ipcRenderer.invoke('show-open-dialog', options),

  // Versão da aplicação
  getVersion: () => '2.0.0',

  // Detecta se estamos dentro do Electron
  isElectron: true
});

