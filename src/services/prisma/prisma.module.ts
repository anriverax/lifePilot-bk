import { Module, Global } from "@nestjs/common";
import { PrismaService } from "./prisma.service";

/**
 * El módulo global para proporcionar y exportar el PrismaService.
 * Este módulo puede ser importado en otros módulos para acceder al PrismaService de forma global.
 */
@Global()
@Module({
  providers: [
    {
      // El token que se usará para la inyección de dependencias.
      provide: PrismaService,

      // La clase que se instanciará para el proveedor.
      useClass: PrismaService
    }
  ],
  /**
   * Los servicios y proveedores que serán exportados por el módulo.
   * @remarks
   * Cualquier módulo que importe PrismaModule podrá acceder a PrismaService.
   */
  exports: [PrismaService]
})
export class PrismaModule {}
