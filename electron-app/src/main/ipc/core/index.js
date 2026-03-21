import { registerAuthHandlers } from './auth.js';
import { registerUsuariosHandlers } from './usuarios.js';
import { registerConfigHandlers } from './config.js';
import { registerEmpresasHandlers } from './empresas.js';
import { registerVinculacionesHandlers } from './vinculaciones.js';

export function registerCoreHandlers() {
  registerAuthHandlers();
  registerUsuariosHandlers();
  registerConfigHandlers();
  registerEmpresasHandlers();
  registerVinculacionesHandlers();
}
