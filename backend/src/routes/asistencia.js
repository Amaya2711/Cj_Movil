import { Router } from 'express';
import {
  getAsistencia,
  registerAsistencia,
  cargarListadoDiario,
  getConstanteOficinas,
  eliminarAsistenciaPrueba,
} from '../controllers/asistenciaController.js';

const router = Router();

router.get('/asistencia', getAsistencia);
router.post('/asistencia/register', registerAsistencia);
router.post('/asistencia/listado-diario', cargarListadoDiario);
router.get('/asistencia/constante-oficinas', getConstanteOficinas);
router.delete('/asistencia/eliminar-prueba', eliminarAsistenciaPrueba);

export default router;