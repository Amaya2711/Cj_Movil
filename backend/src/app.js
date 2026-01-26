import express from 'express';
import cors from 'cors';

import aprobacionRoutes from './routes/aprobacion.js';
import solicitanteRoutes from './routes/solicitanteRoutes.js';
import datosocRoutes from './routes/datosOc.js';

const app = express();
app.use(cors());
app.use(express.json());

// Rutas

app.use('/api', aprobacionRoutes);
app.use('/api', solicitanteRoutes);
app.use('/api', datosocRoutes);

export default app;
