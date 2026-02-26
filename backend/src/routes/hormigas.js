import { Router } from 'express';
import { consultarHormigas, aprobarReaprobacion } from '../controllers/reaprobarController.js';

const router = Router();

router.post('/', consultarHormigas);
router.post('/aprobar', aprobarReaprobacion);

export default router;