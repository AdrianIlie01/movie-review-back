import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import * as crypto from 'crypto';
import process from "process";

@Injectable()
export class CsrfGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    if (!['POST', 'PUT', 'DELETE'].includes(req.method)) return true;

    const csrfTokenFromHeader = req.headers['x-csrf-token'];
    const csrfTokenFromCookie = req.cookies['csrf-token'];

    if (!csrfTokenFromHeader || csrfTokenFromHeader !== csrfTokenFromCookie) {
      throw new ForbiddenException('Invalid CSRF Token');
    }

    //todo creaza un nou cookie for csrf daca a expirat

    return true;
  }
}
