import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable, UnauthorizedException
} from "@nestjs/common";
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { TokenBlackListEntity } from "../../token-black-list/entities/token-black-list.entity";
import * as jwt from 'jsonwebtoken';

@Injectable()
export class RefreshTokenGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}
  async canActivate(context: ExecutionContext) {
    try {

      const request = context.switchToHttp().getRequest();

      const refreshToken = request.cookies['refresh_token'];

      if (!refreshToken) {
        throw new UnauthorizedException('No refresh token provided');
      }

      const blacklistedToken = await TokenBlackListEntity.findOne({
        where: { token: refreshToken },
      });

      if (blacklistedToken) {
        throw new BadRequestException('Refresh token is blacklisted');
      }

      //jwt.verufy - throws an error if the token is invalid or expired
      const decodedRefreshToken = jwt.verify(refreshToken, process.env.SECRET_JWT);

      return true;

    } catch (e) {
      // We don't throw UnauthorizedException for expired or invalid tokens,
      // because the React frontend has an interceptor that, on Unauthorized responses,
      // automatically calls the refresh-token endpoint.
      // This would result in an infinite loop of requests if the refresh also fails.

      if (e.name === 'TokenExpiredError') {
        throw new BadRequestException('Refresh token has expired');
      } else if (e.name === 'JsonWebTokenError') {
        throw new BadRequestException('Invalid refresh token');
      }

      throw new BadRequestException(e.message);
    }
  }
}
