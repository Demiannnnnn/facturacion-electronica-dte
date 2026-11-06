import { describe, it, expect, beforeEach } from 'vitest';
import sync from '../src/main/services/sync-service.js';

describe('sync-service (modo simulación)', () => {
  beforeEach(async () => {
    await sync.processSyncQueue();
  });

  it('encola operaciones con marca de tiempo y las vacía al procesar', async () => {
    expect(sync.getSyncQueueSize()).toBe(0);
    sync.addToSyncQueue({ type: 'factura', payload: { folio: 1 } });
    sync.addToSyncQueue({ type: 'cliente', payload: { id: 2 } });
    expect(sync.getSyncQueueSize()).toBe(2);

    const r = await sync.processSyncQueue();
    expect(r).toMatchObject({ success: true, processed: 0, failed: 0 });
    expect(sync.getSyncQueueSize()).toBe(0);
  });

  it('procesar una cola vacía no falla', async () => {
    expect(await sync.processSyncQueue()).toEqual({ success: true, processed: 0 });
  });

  it('las sincronizaciones simuladas reportan cantidades', async () => {
    expect((await sync.syncProductosToServer([{}, {}, {}])).synced).toBe(3);
    expect((await sync.syncClientesToServer([{}])).synced).toBe(1);
    expect((await sync.syncFacturaToServer({ folio: 7 })).success).toBe(true);
    expect(await sync.checkServerConnection()).toBe(false);
  });
});
