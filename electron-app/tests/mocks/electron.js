import os from 'os';
import path from 'path';
import { vi } from 'vitest';

// Handlers registrados con ipcMain.handle(canal, fn)
export const handlers = new Map();

export const ipcMain = {
  handle: (channel, fn) => handlers.set(channel, fn),
  on: vi.fn(),
  removeHandler: (channel) => handlers.delete(channel)
};

/** Invoca un handler IPC registrado como lo haría ipcRenderer.invoke */
export function invoke(channel, ...args) {
  const fn = handlers.get(channel);
  if (!fn) throw new Error(`Handler IPC no registrado: ${channel}`);
  return fn({}, ...args);
}

let userDataPath = path.join(os.tmpdir(), 'facturacion-tests');

export function setUserDataPath(p) {
  userDataPath = p;
}

export const app = {
  isPackaged: false,
  getPath: () => userDataPath,
  getVersion: () => '0.0.0-test'
};

export const dialog = {
  showOpenDialog: vi.fn(),
  showSaveDialog: vi.fn(),
  showMessageBox: vi.fn()
};

export const shell = {
  openPath: vi.fn(async () => '')
};

export const BrowserWindow = vi.fn();

export default { ipcMain, app, dialog, shell, BrowserWindow };
