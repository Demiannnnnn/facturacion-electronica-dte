import { registerClientesHandlers } from './clientes.js';
import { registerProductosHandlers } from './productos.js';
import { registerFacturasHandlers } from './facturas.js';
import { registerVendedoresHandlers } from './vendedores.js';
import { registerGuiasHandlers } from './guias.js';
import { registerFoliosHandlers } from './folios.js';
import { registerCajaHandlers } from './caja.js';
import { registerPosHandlers } from './pos.js';

export function registerFacturacionHandlers() {
  registerClientesHandlers();
  registerProductosHandlers();
  registerFacturasHandlers();
  registerVendedoresHandlers();
  registerGuiasHandlers();
  registerFoliosHandlers();
  registerCajaHandlers();
  registerPosHandlers();
}
