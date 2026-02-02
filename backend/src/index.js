import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
console.log('Archivos en backend:', fs.readdirSync('.'));
import authRoutes from './routes/auth.js';
import aprobacionRoutes from './routes/aprobacion.js';
import solicitanteRoutes from './routes/solicitanteRoutes.js';
import datosocRoutes from './routes/datosOc.js';

import aprobarPlanillaRoutes from './routes/aprobarPlanilla.js';
import reaprobacionesRoutes from './routes/reaprobaciones.js';
import gastosRoutes from './routes/gastos.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());



app.use('/api/auth', authRoutes);

app.use('/api/aprobaciones', aprobacionRoutes);
app.use('/api', solicitanteRoutes);
app.use('/api', datosocRoutes);
app.use('/api', aprobarPlanillaRoutes);
app.use('/api', gastosRoutes);

// Nueva ruta para reaprobaciones
app.use('/api/Reaprobaciones', reaprobacionesRoutes);

app.get('/', (req, res) => {
  res.send('API backend funcionando');
});

console.log('Valor de process.env.PORT:', process.env.PORT);
const PORT = process.env.PORT;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor backend escuchando en puerto ${PORT} (0.0.0.0)`);
});
