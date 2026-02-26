import express from 'express';
import { listarOcPorEnvio } from '../controllers/ocController.js';

const router = express.Router();

router.get('/oc', listarOcPorEnvio);
router.post('/oc/listar-por-envio', listarOcPorEnvio);
router.post('/OC/listar-por-envio', listarOcPorEnvio);
router.get('/oc/listar-por-envio', listarOcPorEnvio);
router.get('/OC/listar-por-envio', listarOcPorEnvio);

export default router;
