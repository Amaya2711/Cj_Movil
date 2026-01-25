

import { BASE_URL } from '../config';

const API_PATH = '/api/aprobaciones';
export const getAprobaciones = async (idSolicitante = '') => {
  try {
    const url = idSolicitante ? `${BASE_URL}${API_PATH}?IdSolicitante=${encodeURIComponent(idSolicitante)}` : `${BASE_URL}${API_PATH}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Error al consultar aprobaciones');
    return await response.json();
  } catch (error) {
    return [];
  }
};
