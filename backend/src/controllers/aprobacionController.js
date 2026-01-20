import { getConnection, sql } from '../db/mssql.js';

export const getAprobaciones = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request().execute('sp_Planilla_Consulta_Aprobacion');
    console.log('Resultado SP sp_Planilla_Consulta_Aprobacion:', JSON.stringify(result));
    res.json(result.recordset);
  } catch (error) {
    console.error('Error al consultar aprobaciones:', error);
    res.status(500).json({ message: 'Error al consultar aprobaciones', error: error.message });
  }
};
