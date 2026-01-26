import { BASE_URL } from '../config';

export const getDatosOc = async ({ idoc, fila, Site, Tipo_Trabajo }) => {
  try {
    const params = new URLSearchParams({ idoc, fila, Site, Tipo_Trabajo });
    const url = `${BASE_URL}/api/datos-oc?${params.toString()}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Error al consultar datos OC');
    return await response.json();
  } catch (error) {
    return { error: true, message: error.message };
  }
};
