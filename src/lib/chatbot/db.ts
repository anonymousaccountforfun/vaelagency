import pg from 'pg'
const { Pool } = pg

let pool: pg.Pool | null = null

function getPool(): pg.Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 10,
      ssl: { rejectUnauthorized: false },
    })
  }
  return pool
}

export async function query<T extends Record<string, any> = Record<string, any>>(
  text: string,
  params?: any[]
): Promise<pg.QueryResult<T>> {
  return getPool().query<T>(text, params)
}

export { getPool as pool }
