import express from 'express';
import cors from 'cors';

import aprobacionRoutes from './routes/aprobacion.js';
import solicitanteRoutes from './routes/solicitanteRoutes.js';
import datosocRoutes from './routes/datosOc.js';
import planillaRoutes from './routes/planilla.js';

const app = express();
app.use(cors());
app.use(express.json());

// Rutas

app.use('/api', aprobacionRoutes);
app.use('/api', solicitanteRoutes);
app.use('/api', datosocRoutes);
app.use('/api', planillaRoutes);

export default app;
