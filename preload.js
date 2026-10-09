const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('electronAPI', {
  saveData: (d) => ipcRenderer.send('pdr-save', String(d)),
  saveDataSync: (d) => { ipcRenderer.sendSync('pdr-save-sync', String(d)); },
  openDataDir: () => ipcRenderer.send('pdr-open-dir'),
  httpPost: (u, b) => ipcRenderer.invoke('pdr-http', String(u), String(b)),
  httpReq: (o) => ipcRenderer.invoke('pdr-http2', o),
  promptSync: (msg, def) => ipcRenderer.sendSync('pdr-prompt', String(msg || ''), String(def == null ? '' : def))
});
