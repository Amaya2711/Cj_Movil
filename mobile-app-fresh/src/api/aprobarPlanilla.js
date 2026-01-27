import axios from 'axios';

// Ejecuta el store sp_Movil_AprobarPlanilla para un registro
export async function aprobarPlanilla({ ipLocal, CorFil, cIdSite, IdEst, IdResponsable }) {
  // Log para depuración
  console.log('Llamando API aprobarPlanilla con:', { ipLocal, CorFil, cIdSite, IdEst, IdResponsable });
  // Cambia esta URL por la de tu backend real
  const url = 'http://localhost:4000/api/aprobarPlanilla'; // Cambiado al puerto 4000
  console.log('Conectando a:', url);
  return axios.post(url, {
    ipLocal,
    CorFil,
    cIdSite,
    IdEst,
    IdResponsable
  });
}
