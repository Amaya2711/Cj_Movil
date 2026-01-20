
const API_URL = 'http://192.168.137.184:4000/api/aprobaciones';

export const getAprobaciones = async (idSolicitante = '') => {
  try {
    const url = idSolicitante ? `${API_URL}?IdSolicitante=${encodeURIComponent(idSolicitante)}` : API_URL;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Error al consultar aprobaciones');
    return await response.json();
  } catch (error) {
    return [];
  }
};
