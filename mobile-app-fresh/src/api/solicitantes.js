
const API_URL = 'http://192.168.137.184:4000/api/solicitantes'; // Ajusta la URL según tu backend

export const getSolicitantes = async () => {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('Error al consultar solicitantes');
    return await response.json();
  } catch (error) {
    return [];
  }
};
