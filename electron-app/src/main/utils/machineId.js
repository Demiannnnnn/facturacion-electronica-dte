import os from 'os';
import crypto from 'crypto';
import machineIdPkg from 'node-machine-id';

const { machineIdSync } = machineIdPkg;

let cachedMachineId = null;

function getFallbackMachineId() {
  const hostname = os.hostname();
  const platform = os.platform();
  const arch = os.arch();
  const data = `${hostname}-${platform}-${arch}`;
  return crypto.createHash('sha256').update(data).digest('hex').substring(0, 32);
}

export function getMachineId() {
  if (cachedMachineId) {
    return cachedMachineId;
  }

  try {
    cachedMachineId = machineIdSync({ original: false });
  } catch (error) {
    console.warn('[MachineId] Falling back to deterministic local hash:', error.message);
    cachedMachineId = getFallbackMachineId();
  }

  return cachedMachineId;
}
