import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { Prisma, PrismaClient } from "prisma/generated/client";
import { Pool } from "pg";
import { firstCapitalLetter } from '@/common/helpers/functions';

const modelsWithSoftDelete: string[] = [];

// We'll apply $extends to the instance created in the constructor so the adapter is used.

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private pool: Pool;

  constructor(_env: ConfigService) {
    const connectionString = _env.get<string>("database.url");
    const nodeEnv = _env.get<string>("nodeEnv");
    const sslEnabled = nodeEnv === "production" ? true : false;

    const pool = new Pool({
      connectionString,
      ssl: sslEnabled ? { rejectUnauthorized: false } : false
    });

    const adapter = new PrismaPg(pool);

    super({
      adapter
    });

    this.pool = pool;

    const extended = this.$extends({
      result: {
        person: {
          fullName: {
            needs: { firstName: true, lastName1: true, lastName2: true },
            compute(person) {
              const name = `${person.firstName} ${person.lastName1}`;
              return person.lastName2 !== null ? `${name} ${person.lastName2}` : name;
            }
          }
        }
      },
      query: {
        $allModels: {
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
              if (typeof args === "object" && args !== null) {
                args["where"] ??= {};

                if (!("deletedAt" in args["where"])) {
                  args["where"].deletedAt = null;
                }
              }
            }

            return query(args);
          },
          async update({ model, args, query }) {
            if (modelsWithSoftDelete.includes(model)) {
              if (
                typeof args === "object" &&
                args !== null &&
                "where" in args &&
                typeof args.where === "object"
              ) {
                args.where = args.where ?? {};

                if (!("deletedAt" in args.where)) {
                  args.where["deletedAt"] = null;
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

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
    await this.pool.end();
  }

  /* eslint-enable @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-function-return-type */
}
