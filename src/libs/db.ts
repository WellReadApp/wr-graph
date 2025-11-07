import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.PGHOST,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  port: +process.env.PGPORT,
  ssl: {
    rejectUnauthorized: false,
  },
});

const service:any = {};
service.query = async (sql:string, params:any[]) => {
  const result = await pool.query(sql, params);
  return result.rows;
};

service.queryOne = async (sql:string, params:any[]) => {
  const results = await pool.query(sql, params);
  return results.rows[0];
};

export default service;
