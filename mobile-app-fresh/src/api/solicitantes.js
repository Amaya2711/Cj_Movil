
// const API_URL = 'http://192.168.137.184:4000/api/solicitantes'; // Ruta local para desarrollo
const API_URL = 'https://cjmovil-production.up.railway.app/api/solicitantes'; // URL pública de Railway

export const getSolicitantes = async (nombre = '') => {
  try {
    // Si nombre está vacío, no enviar query param
    const url = nombre ? `${API_URL}?NombreEmpleado=${encodeURIComponent(nombre)}` : API_URL;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Error al consultar solicitantes');
    return await response.json();
  } catch (error) {
    return [];
  }
};
