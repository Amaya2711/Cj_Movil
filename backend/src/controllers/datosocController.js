import { getConnection, sql } from '../db/mssql.js';

export const getDatosOc = async (req, res) => {
  try {
    const { idoc, fila, Site, Tipo_Trabajo } = req.body;
    if (!idoc || Number(idoc) <= 0) {
      return res.status(400).json({ message: 'idoc inválido' });
    }
    const pool = await getConnection();
    const request = pool.request();
    request.input('pIdOC', sql.Int, Number(idoc));
    request.input('pFila', sql.Int, fila ? Number(fila) : null);
    request.input('pIdSite', sql.VarChar, Site || null);
    request.input('pIdTipo', sql.VarChar, Tipo_Trabajo || null);
    const result = await request.execute('sp_OrdenCompra_PorcentajePlanilla');
    res.json(result.recordset);
  } catch (error) {
    console.error('Error al consultar datos OC:', error);
    res.status(500).json({ message: 'Error al consultar datos OC', error: error.message });
  }
};
