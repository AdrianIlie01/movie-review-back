import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  NotFoundException,
  ForbiddenException
} from "@nestjs/common";
import { Reflector } from '@nestjs/core';
import { UserService } from '../../user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as jwt from "jsonwebtoken";

@Injectable()
export class IdGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly userService: UserService
  ) {}

  async canActivate(context: ExecutionContext) {
    try {

      console.log('id guard');

      const request = context.switchToHttp().getRequest();

      const accessToken = request.cookies.access_token;

      if (!accessToken) {
        throw new UnauthorizedException('Token missing');
      }

      const decodedToken: any = jwt.verify(accessToken, process.env.SECRET_JWT);

      console.log(decodedToken);

      const userId = decodedToken.id;

      const user = await this.userService.findOne(userId);

      if (!user) {
        console.log('user not found');
        throw new UnauthorizedException('User not found');
      }

      // const userId = decodedToken.id;

      const idFromCode = request.params.id;

      if (userId === idFromCode) {
        return true; // allow access
      } else {
        // return false; // deny access
        throw new UnauthorizedException('User ID does not match');

      }

    } catch (e) {
      throw new ForbiddenException(e.message);
      // throw e;
    }
  }
}
