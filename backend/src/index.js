import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import aprobacionRoutes from './routes/aprobacion.js';
import solicitanteRoutes from './routes/solicitanteRoutes.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());



app.use('/api/auth', authRoutes);

app.use('/api/aprobaciones', aprobacionRoutes);
app.use('/api', solicitanteRoutes);

app.get('/', (req, res) => {
  res.send('API backend funcionando');
});

const PORT = process.env.PORT;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor backend escuchando en puerto ${PORT} (0.0.0.0)`);
});
