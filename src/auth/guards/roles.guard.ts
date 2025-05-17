import {
  BadRequestException,
  CanActivate,
  ExecutionContext, ForbiddenException,
  Injectable
} from "@nestjs/common";
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector, private jwtService: JwtService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const roles = this.reflector.get<string[]>('roles', context.getHandler());

      const request = context.switchToHttp().getRequest();
      // const authHeader = request.headers.authorization;
      // const token = authHeader.split(' ')[1];

      const accessToken = request.cookies['access_token']; // Citește token-ul din cookie

      const decodedToken = await this.jwtService.decode(accessToken);
      const userRole = decodedToken['roles'];

      // return roles.includes(userRole);
      if (!roles.includes(userRole)) {
        throw new ForbiddenException(
          `Userul trebuie sa aibe rol(uri) de: ${roles.join(', ')}`
        );
      }

      return true;
    } catch (e) {
      if (e instanceof ForbiddenException) {
        throw e;
      }
      throw new BadRequestException(e.message);
    }
  }
}
