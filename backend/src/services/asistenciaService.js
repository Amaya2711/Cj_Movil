import { getConnection, sql } from '../db/mssql.js';

export const getAsistenciaService = async (idEmpleado, fechaAsistencia) => {
  const pool = await getConnection();
  const request = pool.request();
  let fecha = null;
  if (fechaAsistencia) {
    const parsed = new Date(fechaAsistencia);
    if (!Number.isNaN(parsed.getTime())) fecha = parsed;
  }
  if (!fecha) fecha = new Date();
  request.input('IdEmpleado', sql.VarChar(50), idEmpleado || '');
  request.input('FechaAsistencia', sql.Date, fecha);
  const result = await request.execute('sp_Asistencia_ListarMes');
  const rows = result.recordset || [];
  return rows.map((row) => ({
    ...row,
    Estado:
      row.Estado ??
      row.estado ??
      row.EstadoMarcacion ??
      row.estadoMarcacion ??
      row.IdEstado ??
      row.idEstado ??
      '',
  }));
};

export const registerAsistenciaService = async ({ usuarioAct, tipo, lat, lon, outOfRange = false, comentario = '', fechaAsistencia = null }) => {
  const pool = await getConnection();
  const usuarioActRaw = String(usuarioAct ?? '').trim();
  if (!/^\d+$/.test(usuarioActRaw)) {
    throw new Error('UsuarioAct inválido para registro de asistencia');
  }
  const usuarioActNumber = Number.parseInt(usuarioActRaw, 10);
  const tipoValue = tipo === null || typeof tipo === 'undefined'
    ? ''
    : String(tipo).trim().toUpperCase();
  const comentarioValue = String(comentario ?? '').trim().slice(0, 250);
  let targetDate = new Date();
  if (fechaAsistencia) {
    const parsedTarget = new Date(fechaAsistencia);
    if (!Number.isNaN(parsedTarget.getTime())) targetDate = parsedTarget;
  }
  const latNumber = (lat === null || typeof lat === 'undefined' || String(lat).trim() === '') ? null : Number(lat);
  const lonNumber = (lon === null || typeof lon === 'undefined' || String(lon).trim() === '') ? null : Number(lon);
  const latValue = Number.isFinite(latNumber) ? latNumber : null;
  const lonValue = Number.isFinite(lonNumber) ? lonNumber : null;
  const outOfRangeValue = !!outOfRange;

  const executeIngreso = async () => {
    const executeIngresoWithCoords = async () => {
      const request = pool.request();
      request.input('UsuarioAct', sql.Int, usuarioActNumber);
      request.input('Comentario', sql.NVarChar(250), comentarioValue);
      request.input('Latitud', sql.Decimal(10, 7), latValue);
      request.input('Longitud', sql.Decimal(10, 7), lonValue);
      return request.execute('sp_Asistencia_ActualizarEstado');
    };

    const executeIngresoLegacy = async () => {
      const request = pool.request();
      request.input('UsuarioAct', sql.Int, usuarioActNumber);
      request.input('Comentario', sql.NVarChar(250), comentarioValue);
      return request.execute('sp_Asistencia_ActualizarEstado');
    };

    let result;
    try {
      result = await executeIngresoWithCoords();
    } catch (error) {
      const message = String(error?.message || '');
      const missingParamError = /too many arguments specified|expects parameter|must declare the scalar variable/i.test(message);
      if (!missingParamError) throw error;
      result = await executeIngresoLegacy();
    }

    if (comentarioValue) {
      const syncCommentByDocRequest = pool.request();
      syncCommentByDocRequest.input('UsuarioAct', sql.Int, usuarioActNumber);
      syncCommentByDocRequest.input('Comentario', sql.NVarChar(250), comentarioValue);
      syncCommentByDocRequest.input('TargetDate', sql.Date, targetDate);
      syncCommentByDocRequest.input('Latitud', sql.Decimal(10, 7), latValue);
      syncCommentByDocRequest.input('Longitud', sql.Decimal(10, 7), lonValue);
      await syncCommentByDocRequest.query(`
        DECLARE @Documento VARCHAR(50);
        SELECT @Documento = NroDocumento
        FROM EmpleadoCJ
        WHERE IdEmpleado = @UsuarioAct;

        UPDATE a
           SET a.Comentario = @Comentario,
               a.Latitud = COALESCE(@Latitud, a.Latitud),
               a.Longitud = COALESCE(@Longitud, a.Longitud)
        FROM Asistencia a
        INNER JOIN EmpleadoCJ b ON a.IdEmpleado = b.IdEmpleado
        WHERE CAST(a.FechaAsistencia AS DATE) = @TargetDate
          AND @Documento IS NOT NULL
          AND (b.NroDocumento = @Documento OR b.NroAlterno = @Documento)
      `);

      const syncCommentByUserRequest = pool.request();
      syncCommentByUserRequest.input('UsuarioAct', sql.Int, usuarioActNumber);
      syncCommentByUserRequest.input('Comentario', sql.NVarChar(250), comentarioValue);
      syncCommentByUserRequest.input('TargetDate', sql.Date, targetDate);
      syncCommentByUserRequest.input('Latitud', sql.Decimal(10, 7), latValue);
      syncCommentByUserRequest.input('Longitud', sql.Decimal(10, 7), lonValue);
      await syncCommentByUserRequest.query(`
        UPDATE a
           SET a.Comentario = @Comentario,
               a.Latitud = COALESCE(@Latitud, a.Latitud),
               a.Longitud = COALESCE(@Longitud, a.Longitud)
        FROM Asistencia a
        WHERE a.IdEmpleado = @UsuarioAct
          AND CAST(a.FechaAsistencia AS DATE) = @TargetDate
      `);

      const syncLatestByDocRequest = pool.request();
      syncLatestByDocRequest.input('UsuarioAct', sql.Int, usuarioActNumber);
      syncLatestByDocRequest.input('Comentario', sql.NVarChar(250), comentarioValue);
      syncLatestByDocRequest.input('TargetDate', sql.Date, targetDate);
      syncLatestByDocRequest.input('Latitud', sql.Decimal(10, 7), latValue);
      syncLatestByDocRequest.input('Longitud', sql.Decimal(10, 7), lonValue);
      await syncLatestByDocRequest.query(`
        DECLARE @Documento VARCHAR(50);
        SELECT @Documento = NroDocumento
        FROM EmpleadoCJ
        WHERE IdEmpleado = @UsuarioAct;

        ;WITH Ult AS (
          SELECT TOP (1) a.IdEmpleado, a.Hora
          FROM Asistencia a
          INNER JOIN EmpleadoCJ b ON a.IdEmpleado = b.IdEmpleado
          WHERE CAST(a.FechaAsistencia AS DATE) = @TargetDate
            AND @Documento IS NOT NULL
            AND (b.NroDocumento = @Documento OR b.NroAlterno = @Documento)
          ORDER BY a.Hora DESC
        )
        UPDATE a
            SET a.Comentario = @Comentario,
              a.Latitud = COALESCE(@Latitud, a.Latitud),
              a.Longitud = COALESCE(@Longitud, a.Longitud)
        FROM Asistencia a
        INNER JOIN Ult u ON a.IdEmpleado = u.IdEmpleado AND a.Hora = u.Hora
        WHERE CAST(a.FechaAsistencia AS DATE) = @TargetDate
      `);
    }

    const persistedCommentRequest = pool.request();
    persistedCommentRequest.input('UsuarioAct', sql.Int, usuarioActNumber);
    persistedCommentRequest.input('TargetDate', sql.Date, targetDate);
    const persistedCommentResult = await persistedCommentRequest.query(`
      SELECT TOP (1)
        a.Comentario,
        a.Latitud,
        a.Longitud,
        a.Hora,
        a.IdEmpleado
      FROM Asistencia a
      WHERE a.IdEmpleado = @UsuarioAct
        AND CAST(a.FechaAsistencia AS DATE) = @TargetDate
      ORDER BY a.Hora DESC
    `);

    const persistedRow = Array.isArray(persistedCommentResult?.recordset) && persistedCommentResult.recordset.length > 0
      ? persistedCommentResult.recordset[0]
      : null;

    return {
      ...(result || {}),
      debugPersistedComentario: persistedRow?.Comentario ?? null,
      debugPersistedLatitud: persistedRow?.Latitud ?? null,
      debugPersistedLongitud: persistedRow?.Longitud ?? null,
      debugPersistedHora: persistedRow?.Hora ?? null,
      debugPersistedIdEmpleado: persistedRow?.IdEmpleado ?? null,
    };
  };

  const executeSalida = async () => {
    const request = pool.request();
    request.input('UsuarioAct', sql.Int, usuarioActNumber);
    request.input('pEnvio', sql.Int, 2);
    request.input('LatitudSalida', sql.Decimal(10, 7), latValue);
    request.input('LongitudSalida', sql.Decimal(10, 7), lonValue);
    request.input('EstadoSalida', sql.Int, outOfRangeValue ? 9 : 0);
    return request.execute('sp_Asistencia_Marcar');
  };

  console.log('[registerAsistenciaService] usuarioAct=%d tipo=%s lat=%s lon=%s outOfRange=%s comentarioLength=%d', usuarioActNumber, tipoValue || 'N/A', latValue ?? 'N/A', lonValue ?? 'N/A', outOfRangeValue, comentarioValue.length);
  const result = tipoValue === 'SALIDA'
    ? await executeSalida()
    : await executeIngreso();
  const normalizedResult = result?.recordset || result;
  if (normalizedResult && typeof normalizedResult === 'object' && !Array.isArray(normalizedResult)) {
    return normalizedResult;
  }
  if (Array.isArray(normalizedResult)) {
    return normalizedResult;
  }
  return result;
};

export const cargarListadoDiarioService = async (usuarioCre) => {
  const pool = await getConnection();
  const request = pool.request();
  const usuarioCreValue = usuarioCre === null || typeof usuarioCre === 'undefined'
    ? ''
    : String(usuarioCre).trim();
  request.input('usuarioCre', sql.VarChar(50), usuarioCreValue);
  const result = await request.execute('sp_CargarListadoDiario');
  return result.recordset || [];
};

export const constanteOficinasService = async () => {
  const pool = await getConnection();
  const request = pool.request();
  const result = await request.execute('sp_Constante_Oficinas');
  return result.recordset || [];
};

export const eliminarAsistenciaPruebaService = async () => {
  const pool = await getConnection();
  const request = pool.request();
  const result = await request.execute('sp_Asistencia_Eliminar_Prueba');
  return result.recordset || result;
};
