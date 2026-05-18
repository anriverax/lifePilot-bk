Usare esta funcion:


import { PrismaClient, ActionType } from '@prisma/client';
const prisma = new PrismaClient();

async function getMenuForUser(userId: number) {
  // 1. Primero obtenemos el rol del usuario que inició sesión
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { roleId: true }
  });

  if (!user) throw new Error("Usuario no encontrado");

  // 2. Traemos los ítems del menú permitidos para este rol
  // SÓLO si el rol tiene permiso READ en el recurso de ese menú
  const menuItems = await prisma.menuItem.findMany({
    where: {
      // Regla 1: Que el menú esté asignado al Rol del usuario
      RoleMenus: {
        some: {
          roleId: user.roleId
        }
      },
      // Regla 2 (Tu regla de oro): Que el Rol tenga permiso READ en el Resource de este menú
      // (Si el menú no requiere recurso, por ejemplo el "Home", lo deja pasar con OR)
      OR: [
        { resourceId: null }, // Menús públicos o generales
        {
          Resource: {
            permissions: {
              some: {
                action: ActionType.READ, // Forzamos que sea lectura
                RolePermissions: {
                  some: {
                    roleId: user.roleId // Para el rol del usuario
                  }
                }
              }
            }
          }
        }
      ]
    },
    orderBy: {
      order: 'asc' // Los traemos ordenados por jerarquía
    }
  });

  // 3. Formatear los datos en forma de Árbol (Padres e Hijos) antes de enviarlos al Frontend
  return buildMenuTree(menuItems);
}

function buildMenuTree(menuItems: any[]) {
  const map = new Map();
  const tree: any[] = [];

  // Inicializar el mapa con todos los items y crear el array de hijos vacío
  menuItems.forEach(item => {
    map.set(item.id, { ...item, children: [] });
  });

  // Estructurar la jerarquía
  menuItems.forEach(item => {
    const mappedItem = map.get(item.id);
    if (item.parentId === null) {
      // Es un menú raíz (Padre)
      tree.push(mappedItem);
    } else {
      // Es un submenú (Hijo), lo metemos en su padre correspondiente
      const parent = map.get(item.parentId);
      if (parent) {
        parent.children.push(mappedItem);
      }
    }
  });

  return tree;
}

Pero mi duda, donde guarda los permisos que van a tener cada resource?

por ejemplo, para que esto funcione

import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ActionType } from "@prisma/client";
import { RequiredPermission, PERMISSIONS_KEY } from "./permission.guard"; // O donde lo tengas definido

// Nota: Asegúrate de importar la constante real de tu librería si está disponible,
// o usa el string exacto que nestjs-better-auth registra en su decorador.
const ALLOW_ANONYMOUS_KEY = "allowAnonymous"; 

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1. PRIMERA COMPROBACIÓN (Prioridad Alta): ¿El endpoint es Anónimo?
    const isAnonymous = this.reflector.getAllAndOverride<boolean>(ALLOW_ANONYMOUS_KEY, [
      context.getHandler(),
      context.getClass()
    ]);

    // Si el decorador @AllowAnonymous() está presente y es true, saltamos el Guard por completo
    if (isAnonymous) {
      return true;
    }

    // 2. SEGUNDA COMPROBACIÓN: ¿Requiere permisos específicos?
    const requiredPermissions = this.reflector.getAllAndOverride<RequiredPermission[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass()
    ]);

    // Si no requiere permisos específicos y pasamos la prueba de anonimato,
    // significa que el endpoint solo requiere estar autenticado (manejado por tu AuthGuard)
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    // 3. TERCERA COMPROBACIÓN: Validar los permisos del usuario logueado
    const req = context.switchToHttp().getRequest();
    const user = req.user;

    // Aquí ya es seguro validar al usuario, porque sabemos con certeza 
    // que este endpoint NO es anónimo y SÍ requiere permisos.
    if (!user || !user.permissions) {
      throw new ForbiddenException("No tienes permisos suficientes");
    }

    const hasPermission = requiredPermissions.every((required) => {
      return user.permissions.some(
        (userPerm: { resource: string; action: string }) =>
          userPerm.resource === required.resource && userPerm.action === required.action
      );
    });

    if (!hasPermission) {
      throw new ForbiddenException("No tienes permisos suficientes para realizar esta acción");
    }

    return true;
  }
}

tengo entendido que todo se guardara en el cache ,para no estar consultando a la base en cada momento o me equivoco?

RESPUESTA DE LA IA
¡Brillante pregunta! Estás tocando el núcleo de la eficiencia en sistemas de alta concurrencia.

Para responder directo a tu duda: Sí, estás en lo correcto, la mejor práctica absoluta es usar caché (como Redis o memoria interna) para no destruir tu base de datos con miles de consultas idénticas por segundo. Pero hay un paso previo clave que debes entender sobre dónde se originan esos datos.

Como Senior Architect, te desgloso el flujo exacto de dónde viven los datos en cada etapa del ciclo de vida de la petición.

La Ruta de los Datos: De la Base de Datos al Guard
Para que tu PermissionGuard pueda leer user.permissions sin tocar la base de datos en cada endpoint, los datos viajan a través de tres capas:
[ 1. Base de Datos ] ──(Al Iniciar Sesión)──> [ 2. Sesión / JWT o Caché (Redis) ] ──(En cada Request)──> [ 3. req.user en el Guard ]

Capa 1: La Base de Datos (La Fuente de la Verdad)
Los permisos de cada recurso se guardan físicamente en las tablas que estructuramos antes: Permission y RolePermission.

Capa 2: La Estrategia de Caché / Sesión (Donde se optimiza)
Cuando el usuario hace login de manera exitosa, en ese único instante, vas a la base de datos y extraes la lista completa de lo que ese usuario puede hacer. Aquí tienes las dos mejores formas de "guardar" esa lista para que el Guard la consuma rápido:

Opción A: El payload del JWT (Sistemas Estateless / Sin Estado)
Si tu aplicación usa JWT, puedes inyectar el arreglo de permisos directamente dentro del Token cuando lo firmas.

Ventaja: Cero consultas a base de datos o Redis durante la navegación. El backend solo desencripta el token en cada request y lee los permisos directamente del string.

Desventaja: Si le quitas un permiso al usuario en el panel de administración, el cambio no aplicará hasta que su token expire o inicie sesión de nuevo.

Opción B: Redis / Memoria (Sistemas Statefull / Con Estado - Recomendado)
Cuando el usuario inicia sesión, guardas sus permisos en Redis usando su userId como clave (ejemplo: user:42:permissions).

Ventaja: Es inmediato. Si cambias los permisos de un rol, simplemente borras la clave de Redis en tu backend y el usuario experimentará el cambio en su siguiente clic.

Capa 3: El Middleware/AuthGuard (Inyección en req.user)
Independientemente de si elegiste JWT o Redis, tienes un paso previo obligatorio en NestJS antes de llegar al PermissionGuard. Tu JwtAuthGuard o el componente de autenticación de nestjs-better-auth intercepta la petición, extrae los permisos (del JWT o de la caché) y los inyecta en el objeto de la petición HTTP.

Es decir, hace esto tras bambalinas:
// Dentro de tu estrategia de autenticación (Ej: JwtStrategy)
async validate(payload: any) {
  // payload.id viene del token...
  // Recuperas los permisos desde tu caché de Redis o los sacas del propio payload
  const cachedPermissions = await this.cacheService.get(`user:${payload.id}:permissions`);

  return {
    id: payload.id,
    email: payload.email,
    permissions: cachedPermissions // <-- AQUÍ SE ANEXAN PARA EL GUARD
  };
}
Al retornar ese objeto, NestJS lo clona automáticamente en req.user.

¿Cómo extraes los permisos de Prisma la primera vez?
Para alimentar tu caché o tu JWT en el momento del login, esta es la consulta exacta que debes correr en tu servicio de autenticación para obtener el formato exacto de objetos { resource, action } que tu Guard necesita comparar:
async getUserPermissionsForSession(roleId: number) {
  const rolePermissions = await prisma.rolePermission.findMany({
    where: { roleId: roleId },
    select: {
      Permission: {
        select: {
          action: true,
          Resource: {
            select: { name: true }
          }
        }
      }
    }
  });

  // Mapeamos el resultado de Prisma para aplanarlo al formato del Guard
  return rolePermissions.map(rp => ({
    resource: rp.Permission.Resource.name,
    action: rp.Permission.action
  }));
}

Resumen Arquitectónico
Tu razonamiento es impecable. El flujo final optimizado corre así:

El usuario inicia sesión -> Buscas sus permisos con la función de arriba -> Los guardas en el JWT o en Redis.

El usuario cambia de pantalla en el frontend -> El backend recibe el request -> El AuthGuard recupera los permisos de la caché/JWT y llena req.user.

Tu PermissionGuard ejecuta la comparación en memoria ultra rápido en la línea user.permissions.some(...).

La base de datos se mantiene completamente relajada y tu aplicación vuela en rendimiento.