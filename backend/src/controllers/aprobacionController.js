import { getConnection, sql } from '../db/mssql.js';

export const getAprobaciones = async (req, res) => {
  try {
    const pool = await getConnection();
    // Obtener y convertir el parámetro a INT
    let idSolicitante = req.query.IdSolicitante;
    if (idSolicitante !== undefined && idSolicitante !== null && idSolicitante !== '') {
      idSolicitante = parseInt(idSolicitante, 10);
      if (isNaN(idSolicitante)) idSolicitante = null;
    } else {
      idSolicitante = null;
    }
    const request = pool.request();
    request.input('IdSolicitante', sql.Int, idSolicitante);
    const result = await request.execute('sp_Planilla_Consulta_Aprobacion');
    console.log('Resultado SP sp_Planilla_Consulta_Aprobacion:', JSON.stringify(result));
    res.json(result.recordset);
  } catch (error) {
    console.error('Error al consultar aprobaciones:', error);
    res.status(500).json({ message: 'Error al consultar aprobaciones', error: error.message });
  }
};
