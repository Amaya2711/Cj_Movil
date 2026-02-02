import { BASE_URL } from '../config';

const API_PATH = '/api/reportes/gastos';

export const getReporteGastos = async (monedas = null) => {
  try {
    const url = `${BASE_URL}${API_PATH}`;
    const body = monedas && monedas.length > 0 ? { Monedas: monedas.join(',') } : {};
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: Object.keys(body).length ? JSON.stringify(body) : undefined,
    });
    if (!response.ok) throw new Error('Error al consultar el reporte de gastos');
    return await response.json();
  } catch (error) {
    return { error: true, message: error.message };
  }
};
