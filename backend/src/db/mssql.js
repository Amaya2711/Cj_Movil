import sql from 'mssql';
import dotenv from 'dotenv';
dotenv.config();

console.log('SQLSERVER_HOST en mssql.js:', process.env.SQLSERVER_HOST);

const config = {
  user: process.env.SQLSERVER_USER,
  password: process.env.SQLSERVER_PASSWORD,
  server: process.env.SQLSERVER_HOST,
  port: process.env.SQLSERVER_PORT ? parseInt(process.env.SQLSERVER_PORT, 10) : 1433,
  database: process.env.SQLSERVER_DB,
  options: {
    encrypt: true, // Para Azure
    trustServerCertificate: true // Para desarrollo local
  }
};

export const getConnection = async () => {
  try {
    const pool = await sql.connect(config);
    return pool;
  } catch (err) {
    throw new Error('Error de conexión a SQL Server: ' + err.message);
  }
};

export { sql };
