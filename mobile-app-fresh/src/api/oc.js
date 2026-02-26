import { BASE_URL } from '../config';

const API_PATH = '/api/oc';

export const getOcPorEnvio = async (Envio = '') => {
  try {
    let url = `${BASE_URL}${API_PATH}`;
    const params = [];
    if (Envio) params.push(`Envio=${encodeURIComponent(Envio)}`);
    if (params.length > 0) url += `?${params.join('&')}`;
    console.log('Conectando a:', url);
    const response = await fetch(url);
    if (!response.ok) {
      const message = await response.text();
      throw new Error(`Error al consultar OC por envío (${response.status}): ${message}`);
    }
    return await response.json();
  } catch (error) {
    console.error('getOcPorEnvio error:', error?.message || error);
    return [];
  }
};
