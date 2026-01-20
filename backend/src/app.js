import express from 'express';
import cors from 'cors';
import aprobacionRoutes from './routes/aprobacion.js';

const app = express();
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api', aprobacionRoutes);

export default app;
