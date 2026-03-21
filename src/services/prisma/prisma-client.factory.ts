import { PrismaPg } from "@prisma/adapter-pg";
import { Prisma } from "@prisma/client";
import { Pool, PoolConfig } from "pg";

/**
 * Parámetros necesarios para crear el cliente de Prisma y el pool de conexiones.
 */
interface CreatePrismaClientFactoryParams {
  /** Cadena de conexión a la base de datos (DATABASE_URL). */
  connectionString?: string;
  /** Entorno de ejecución de la aplicación (ej. "production", "development"). */
  nodeEnv?: string;
}

/**
 * Devuelve la configuración SSL para el pool de pg según el entorno.
 * En producción se deshabilita la validación del certificado del servidor
 * para permitir conexiones a bases de datos administradas (ej. RDS, Supabase).
 * @param nodeEnv - El entorno de ejecución actual.
 * @returns La configuración SSL adecuada para el entorno.
 */
const createSslConfig = (nodeEnv?: string): PoolConfig["ssl"] => {
  return nodeEnv === "production" ? { rejectUnauthorized: false } : false;
};

/**
 * Crea un pool de conexiones pg configurado con la cadena de conexión y el entorno dados.
 * @param params - Parámetros que incluyen la cadena de conexión y el entorno.
 * @returns Una instancia de Pool lista para ser usada por el adaptador de Prisma.
 * @throws {Error} Si no se proporciona la cadena de conexión.
 */
export const createPrismaPool = ({
  connectionString,
  nodeEnv
}: CreatePrismaClientFactoryParams): Pool => {
  if (!connectionString) {
    throw new Error("DATABASE_URL is required to initialize Prisma client");
  }

  return new Pool({
    connectionString,
    ssl: createSslConfig(nodeEnv)
  });
};

/**
 * Genera las opciones de configuración para PrismaClient a partir de un pool de pg existente.
 * Utiliza el adaptador PrismaPg para integrar el pool con el cliente de Prisma.
 * @param pool - El pool de conexiones pg que usará el adaptador.
 * @returns Las opciones de configuración compatibles con el constructor de PrismaClient.
 */
export const createPrismaClientOptions = (pool: Pool): Prisma.PrismaClientOptions => {
  return {
    adapter: new PrismaPg(pool)
  };
};

/**
 * Función de fábrica principal que crea el pool de pg y las opciones del cliente de Prisma
 * en un único paso. Útil para inicializar ambos recursos de forma conjunta.
 * @param params - Parámetros que incluyen la cadena de conexión y el entorno.
 * @returns Un objeto con el pool de pg y las opciones de configuración del cliente de Prisma.
 */
