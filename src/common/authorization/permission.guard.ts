import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "@/lib/auth";
import { AuthorizationService } from "../../api/auth/services/authorization.service";
import { PERMISSIONS_KEY, RequiredPermission } from "./permission.decorator";
import { AuthorizationSnapshot } from "@/api/auth/domain/auth.entity";

const ALLOW_ANONYMOUS_KEY = "allowAnonymous";

type RequestWithAuthorization = {
  headers: Record<string, string | string[] | undefined>;
  session?: {
    user: {
      id: number | string;
    };
  } | null;
  permissions?: AuthorizationSnapshot["permissions"];
  authorization?: AuthorizationSnapshot;
};

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authorizationService: AuthorizationService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isAnonymous = this.reflector.getAllAndOverride<boolean>(ALLOW_ANONYMOUS_KEY, [
      context.getHandler(),
      context.getClass()
    ]);

    if (isAnonymous) {
      return true;
    }

    const requiredPermissions = this.reflector.getAllAndOverride<RequiredPermission[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass()
    ]);

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithAuthorization>();
    const session =
      request.session ??
      (await auth.api.getSession({
        headers: fromNodeHeaders(request.headers)
      }));

    if (!session) {
      throw new UnauthorizedException("No hay una sesión válida para acceder a este recurso");
    }

    request.session = session;

    const snapshot = await this.authorizationService.getAuthorizationSnapshot(session.user.id);

    request.authorization = snapshot;
    request.permissions = snapshot.permissions;

    const hasPermission = requiredPermissions.every((required) =>
      snapshot.permissions.some(
        (userPermission) =>
          userPermission.resource === required.resource && userPermission.action === required.action
      )
    );

    if (!hasPermission) {
      throw new ForbiddenException("No tienes permisos suficientes para realizar esta acción");
    }

    return true;
  }
}
