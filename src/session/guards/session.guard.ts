import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { SessionService } from "../session.service";

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(private readonly sessionService: SessionService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    const sessionId = req.cookies['sessionId'];
    if (!sessionId) throw new UnauthorizedException('Missing session');

    const session = await this.sessionService.getSession(sessionId);
    if (!session) throw new UnauthorizedException('Invalid or expired session');

    const now = Date.now();

    console.log('IDLE_TIMEOUT');
    console.log(process.env.IDLE_TIMEOUT);

    if (now - session.lastActivity > Number(process.env.IDLE_TIMEOUT) * 1000) {
      await this.sessionService.destroySession(sessionId);
      throw new UnauthorizedException('Session expired due to inactivity');
    }

    await this.sessionService.updateLastActivity(sessionId);

    req.user = { id: session.userId };
    return true;
  }
}
