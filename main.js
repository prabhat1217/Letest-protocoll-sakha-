const { app, BrowserWindow, Menu, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs');

/* ડેટા ફોલ્ડર: EXE ની બાજુમાં PROTOCOL-SAKHA-DATA (પેનડ્રાઈવ સાથે લઈ જઈ શકાય). લખી ન શકાય તો યુઝર ફોલ્ડરમાં. */
function pickDataDir() {
  const base = process.env.PORTABLE_EXECUTABLE_DIR || path.dirname(process.execPath);
  const cands = [path.join(base, 'PROTOCOL-SAKHA-DATA'), path.join(app.getPath('documents'), 'PROTOCOL-SAKHA-DATA')];
  for (const c of cands) {
    try { fs.mkdirSync(path.join(c, 'profile'), { recursive: true }); fs.accessSync(c, fs.constants.W_OK); return c; } catch (e) {}
  }
  return null;
}
const dataDir = pickDataDir();
if (dataDir) app.setPath('userData', path.join(dataDir, 'profile'));

if (!app.requestSingleInstanceLock()) { app.quit(); }

function writeData(d) {
  if (!dataDir) return;
  try {
    const f = path.join(dataDir, 'PROTOCOL-SAKHA-DATA.json');
    fs.writeFileSync(f + '.tmp', d); fs.renameSync(f + '.tmp', f);
    const day = new Date().toISOString().slice(0, 10);
    const bk = path.join(dataDir, 'backup'); fs.mkdirSync(bk, { recursive: true });
    const bf = path.join(bk, 'PROTOCOL-SAKHA-BACKUP-' + day + '.json');
    if (!fs.existsSync(bf)) fs.writeFileSync(bf, d);
  } catch (e) {}
}
ipcMain.on('pdr-save', (e, d) => writeData(d));
ipcMain.on('pdr-save-sync', (e, d) => { writeData(d); e.returnValue = true; });
ipcMain.on('pdr-open-dir', () => { if (dataDir) shell.openPath(dataDir); });

ipcMain.handle('pdr-http', async (e, url, body) => {
  const r = await fetch(url, { method: 'POST', body: body, redirect: 'follow' });
  return await r.text();
});

ipcMain.handle('pdr-http2', async (e, o) => {
  try {
    if (!o || !/^https:\/\/(identitytoolkit|securetoken|firestore)\.googleapis\.com\//.test(String(o.url))) return { status: 0, text: '{"error":{"message":"blocked url"}}' };
    const r = await fetch(o.url, { method: o.method || 'POST', headers: o.headers || {}, body: o.body, redirect: 'follow' });
    return { status: r.status, text: await r.text() };
  } catch (err) { throw new Error('ઇન્ટરનેટ/નેટવર્ક સમસ્યા'); }
});

let main;
ipcMain.on('pdr-prompt', (e, msg, def) => {
  const w = new BrowserWindow({
    parent: main, modal: true, width: 440, height: 230, resizable: false, minimizable: false, maximizable: false,
    title: 'PROTOCOL SAKHA', autoHideMenuBar: true,
    webPreferences: { preload: path.join(__dirname, 'prompt-preload.js'), contextIsolation: true, nodeIntegration: false }
  });
  w.setMenu(null);
  let answered = false;
  const onDone = (ev, v) => { if (ev.sender !== w.webContents) return; answered = true; ipcMain.removeListener('pdr-prompt-done', onDone); e.returnValue = v; w.close(); };
  ipcMain.on('pdr-prompt-done', onDone);
  w.on('closed', () => { if (!answered) { ipcMain.removeListener('pdr-prompt-done', onDone); e.returnValue = null; } });
  w.loadFile(path.join(__dirname, 'prompt.html'), { query: { m: msg, d: def } });
});

function createWindow() {
  main = new BrowserWindow({
    width: 1280, height: 800, title: 'PROTOCOL SAKHA',
    icon: path.join(__dirname, 'build', 'icon.png'),
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false }
  });
  Menu.setApplicationMenu(null);
  main.loadFile(path.join(__dirname, 'www', 'index.html'));
}
app.whenReady().then(createWindow);
app.on('second-instance', () => { if (main) { if (main.isMinimized()) main.restore(); main.focus(); } });
app.on('window-all-closed', () => app.quit());
