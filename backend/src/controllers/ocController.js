import { getConnection, sql } from '../db/mssql.js';

export const listarOcPorEnvio = async (req, res) => {
  try {
    const envio = String(
      req.body?.Envio || req.body?.envio || req.query?.Envio || req.query?.envio || ''
    ).trim();
    const idOc = req.body?.IdOC ?? req.query?.IdOC ?? null;
    const idSolicitante = req.body?.IdSolicitante ?? req.query?.IdSolicitante ?? null;
    const idResponsable = req.body?.IdResponsable ?? req.query?.IdResponsable ?? null;
    const idCliente = req.body?.IdCliente ?? req.query?.IdCliente ?? null;
    const idProyecto = req.body?.IdProyecto ?? req.query?.IdProyecto ?? null;

    if (!envio) {
      return res.status(400).json({ message: 'El parámetro Envio es obligatorio' });
    }

    const parseNullableInt = (value) => {
      if (value === null || value === undefined || value === '') return null;
      const parsed = Number.parseInt(value, 10);
      return Number.isNaN(parsed) ? null : parsed;
    };

    const pool = await getConnection();
    const request = pool.request();
    request.input('Envio', sql.VarChar(20), envio);
    request.input('IdOC', sql.Int, parseNullableInt(idOc));
    request.input('IdSolicitante', sql.Int, parseNullableInt(idSolicitante));
    request.input('IdResponsable', sql.Int, parseNullableInt(idResponsable));
    request.input('IdCliente', sql.Int, parseNullableInt(idCliente));
    request.input('IdProyecto', sql.Int, parseNullableInt(idProyecto));

    const result = await request.execute('dbo.sp_OC_Listar_PorEnvio');
    return res.json(result.recordset || []);
  } catch (error) {
    console.error('Error al listar OC por envio:', error);
    return res.status(500).json({ message: 'Error al listar OC por envio', error: error.message });
  }
};
