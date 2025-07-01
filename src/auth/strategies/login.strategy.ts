import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import { UserEntity } from '../../user/entities/user.entity';
import * as jwt from 'jsonwebtoken';
import * as process from "process";
import { TokenBlackListEntity } from "../../token-black-list/entities/token-black-list.entity";
import { Status } from "../../shared/status";

@Injectable()
// passport strategy return in req.user
export class LoginStrategy extends PassportStrategy(Strategy, 'login') {
  constructor() {
    super();
  }
  async validate(req) {
    try {

      const accessToken = req.cookies.access_token;

      if (!accessToken) {
        throw new UnauthorizedException('Token missing');
      }

      const blacklistedAccessToken = await TokenBlackListEntity.findOne({
        where: { token: accessToken },
      });

      if (blacklistedAccessToken) {
        throw new UnauthorizedException('Token is blacklisted');
      }

       const decodedAccessToken: any = jwt.verify(accessToken, process.env.SECRET_JWT);

       if (!decodedAccessToken) {
         throw new UnauthorizedException('Invalid access token');
       }

       const user = await UserEntity.findOne({ where: { username: decodedAccessToken.username } });

       if (!user) {
         throw new UnauthorizedException('User not found');
       }


       if (decodedAccessToken._2fa_required === true) {
         throw new UnauthorizedException('User needs to validate otp');
       }

      if (user.status === Status.Banned) {
        throw new UnauthorizedException('User is banned');
      }

      if (decodedAccessToken.authenticate !== true) {
        throw new UnauthorizedException('User is not authenticated');
      }

      // req.user = decodedAccessToken;
      return { message: 'User authenticated successfully', decodedAccessToken };
    } catch (e) {
      throw new UnauthorizedException(e.message);
    }
  }
}
