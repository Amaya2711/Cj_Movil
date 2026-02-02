import { Router } from 'express';
import { consultarReaprobaciones, aprobarReaprobacion } from '../controllers/reaprobarcontroller.js';

const router = Router();

// Ruta para consultar reaprobaciones
router.post('/', consultarReaprobaciones);

// Ruta para aprobar planilla desde re-aprobaciones
router.post('/aprobar', aprobarReaprobacion);

export default router;
