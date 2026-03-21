import { registerBackupHandlers, createAutomaticBackup } from './backup.js';
import { registerExportHandlers } from './export.js';
import { registerImportHandlers } from './import.js';
import { registerSyncHandlers } from './sync.js';
import { registerSeedHandlers } from './seed.js';
import './subscription.js';

export function registerSistemaHandlers({ enableSeed = false } = {}) {
  registerBackupHandlers();
  registerExportHandlers();
  registerImportHandlers();
  registerSyncHandlers();

  if (enableSeed) {
    registerSeedHandlers();
  }
}

export { createAutomaticBackup };
