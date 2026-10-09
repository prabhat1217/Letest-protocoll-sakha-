const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('promptAPI', { done: (v) => ipcRenderer.send('pdr-prompt-done', v) });
