import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { Prisma, PrismaClient } from "@prisma/client";
import { firstCapitalLetter } from "@/common/helpers/functions";
import { createPrismaClientOptions } from "./prisma-client.factory";
import { closeSharedPrismaPool, getSharedPrismaPool } from "./prisma-singleton";

/**
 * Lista de nombres de modelos de Prisma que admiten eliminación lógica (soft delete).
 * Agregar el nombre del modelo aquí activa el filtrado automático por `deletedAt`
 * en las operaciones de lectura y actualización.
 */
const modelsWithSoftDelete: string[] = [];

// Se aplica $extends sobre la instancia creada en el constructor para que el adaptador sea usado.

/**
 * Servicio de Prisma para NestJS.
 * Extiende PrismaClient reutilizando el pool compartido de pg e implementa
 * un middleware de consulta que filtra automáticamente los registros con
 * eliminación lógica (soft delete) para los modelos configurados.
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    // Se reutiliza el pool compartido para mantener un único pool de conexiones en el proceso.
    // El pool compartido se inicializa a partir de DATABASE_URL.
    const pool = getSharedPrismaPool();
    super(createPrismaClientOptions(pool));

    // Se extiende el cliente para agregar el middleware de soft delete sobre todos los modelos.
    const extended = this.$extends({
      query: {
        $allModels: {
          /**
           * Intercepta todas las operaciones de lectura y filtra automáticamente
           * los registros eliminados lógicamente (`deletedAt != null`) en los modelos
           * incluidos en `modelsWithSoftDelete`.
           */
          $allOperations({ model, operation, args, query }) {
            const operationsToFilter = [
              "findUnique",
              "findFirst",
              "findMany",
              "count",
              "aggregate",
              "groupBy"
            ];

            if (modelsWithSoftDelete.includes(model) && operationsToFilter.includes(operation)) {
              const typedArgs = args as Record<string, unknown>;
              if (typeof typedArgs === "object" && typedArgs !== null) {
                // Inicializa la cláusula where si no existe.
                typedArgs["where"] ??= {};
                const where = typedArgs["where"] as Record<string, unknown>;

                // Solo agrega el filtro si no fue especificado explícitamente por el llamador.
                if (!("deletedAt" in where)) {
                  where.deletedAt = null;
                }
              }
            }

            return query(args);
          },
          /**
           * Intercepta las operaciones de actualización para garantizar que sólo
           * se actualicen registros que no han sido eliminados lógicamente.
           */
          async update({ model, args, query }) {
            if (modelsWithSoftDelete.includes(model)) {
              const typedArgs = args as Record<string, unknown>;
              if (
                typeof typedArgs === "object" &&
                typedArgs !== null &&
                "where" in typedArgs &&
                typeof typedArgs.where === "object"
              ) {
                typedArgs.where = typedArgs.where ?? {};
                const where = typedArgs.where as Record<string, unknown>;

                // Solo agrega el filtro si no fue especificado explícitamente por el llamador.
                if (!("deletedAt" in where)) {
                  where["deletedAt"] = null;
                }
              }
            }

            return query(args);
          }
        }
      }
    });

    Object.assign(this, extended);
  }

  /* eslint-disable @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-function-return-type */
  /**
   * Realiza una eliminación lógica (soft delete) sobre el registro que coincida
   * con la cláusula `where` del modelo indicado, estableciendo `deletedAt` con
   * la fecha y hora actuales.
   * @param modelName - El nombre del modelo de Prisma sobre el que se ejecutará la operación.
   * @param where - La cláusula de filtrado que identifica el registro a eliminar.
   * @param additionalData - Datos extra que se incluirán en la operación de actualización.
   * @throws {Error} Si el modelo no existe, no admite actualizaciones, no está configurado
   *   para soft delete o si la cláusula `where` es inválida o está vacía.
   */
  async softDelete<T extends keyof PrismaClient>(
    modelName: T,
    where: Prisma.Args<PrismaClient[T], "update">["where"],
    additionalData?: Prisma.Args<PrismaClient[T], "update">["data"]
  ) {
    if (typeof this[modelName] !== "object" || typeof (this[modelName] as any).update !== "function") {
      throw new Error(
        `El modelo ${String(modelName)} no se encuentra o no admite operaciones de actualización.`
      );
    }

    if (!modelsWithSoftDelete.includes(firstCapitalLetter(String(modelName)))) {
      throw new Error(`El modelo ${String(modelName)} no soporta soft deletion.`);
    }

    if (!where || Object.keys(where).length === 0) {
      throw new Error(`Falta la cláusula «where» o no es válida para ${String(modelName)}.`);
    }

    const data = {
      ...additionalData,
      deletedAt: new Date()
    };

    return (this[modelName] as any).update({ where, data });
  }

  /**
   * Se ejecuta automáticamente al inicializar el módulo de NestJS.
   * Establece la conexión con la base de datos a través de Prisma.
   */
  async onModuleInit() {
    await this.$connect();
  }

  /**
   * Se ejecuta automáticamente al destruir el módulo de NestJS.
   * Desconecta el cliente de Prisma y cierra el pool de conexiones compartido.
   */
  async onModuleDestroy() {
    await this.$disconnect();
    await closeSharedPrismaPool();
  }

  /* eslint-enable @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-function-return-type */
}
