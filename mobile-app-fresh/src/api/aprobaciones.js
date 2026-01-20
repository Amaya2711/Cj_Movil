import axios from 'axios';

const API_URL = 'http://192.168.137.184:4000/api/aprobaciones'; // IP local de tu PC, asegúrate que sea accesible desde tu dispositivo

export const getAprobaciones = async () => {
  const res = await axios.get(API_URL);
  return res.data;
};
