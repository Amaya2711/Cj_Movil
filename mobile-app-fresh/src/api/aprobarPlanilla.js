import axios from 'axios';

// Ejecuta el store sp_Movil_AprobarPlanilla para un registro
export async function aprobarPlanilla({ ipLocal, CorFil, cIdSite }) {
  // Log para depuración
  console.log('Llamando API aprobarPlanilla con:', { ipLocal, CorFil, cIdSite });
  console.log('Conectando a: /api/aprobarPlanilla');
  const url = '/api/aprobarPlanilla';
  return axios.post(url, {
    ipLocal,
    CorFil,
    cIdSite
  });
}
