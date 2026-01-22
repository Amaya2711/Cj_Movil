
// const API_URL = 'http://192.168.137.184/api/aprobaciones'; // Ruta local para desarrollo
const API_URL = 'https://cjmovil-production.up.railway.app/api/aprobaciones'; // URL pública de Railway

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
