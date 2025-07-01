import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpStatus, Ip,
  Param,
  Post,
  Req,
  Res, UnauthorizedException,
  UseGuards
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LoginUserDto } from "./dto/login-user.dto";
import { Action } from "../shared/action";
import { LoginGuard } from "./guards/login.guards";
import * as process from "process";
import { RefreshTokenGuard } from "./guards/refresh-token.guard";
import { Roles } from "./decorators/roles.decorator";
import { RolesGuard } from "./guards/roles.guard";
import { TokenBlackListEntity } from "../token-black-list/entities/token-black-list.entity";
import { SessionService } from "../session/session.service";
import { SessionGuard } from "../session/guards/session.guard";
import { CsrfGuard } from "./guards/csrf.guard";
import * as crypto from 'crypto';
import * as jwt from "jsonwebtoken";
import { UserEntity } from "../user/entities/user.entity";
import { Status } from "../shared/status";

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly sessionService: SessionService
    ) {}

  // login non-session

  // @Post('login')
  // async login(
  //   @Res() res,
  //   @Req() req,
  //   @Body() loginUserDto: LoginUserDto
  // ) {
  //   try {
  //     // From the frontend, we clear any existing access_token and refresh_token.
  //     // 1. For a full login, we set both: access_token and refresh_token.
  //     // 2. For login with 2FA enabled, we only set the access_token with a property `2fa: true`.
  //
  //     // When checking if the user is logged in, we look for tokens in cookies
  //     // and validate both access_token and refresh_token JWTs.
  //
  //
  //     if (req.cookies['access_token']) {
  //       res.clearCookie('access_token', {
  //         httpOnly: true,
  //         secure: process.env.NODE_ENV === 'production',
  //         sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  //         maxAge: +process.env.ACCESS_TOKEN_EXPIRES_IN,
  //       });
  //     }
  //
  //     if (req.cookies['refresh_token']) {
  //       res.clearCookie('refresh_token', {
  //         httpOnly: true,
  //         secure: process.env.NODE_ENV === 'production',
  //         sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  //         maxAge: +process.env.REFRESH_TOKEN_EXPIRES_IN,
  //       });
  //     }
  //
  //     const login: any = await this.authService.login(loginUserDto);
  //
  //     if (login.access_token) {
  //       res.cookie('access_token', login.access_token, {
  //         httpOnly: true,
  //         secure: process.env.NODE_ENV === 'production',
  //         sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  //         maxAge: parseInt(process.env.ACCESS_TOKEN_EXPIRES_IN)
  //       });
  //     }
  //
  //     if (login.access_token_2fa) {
  //
  //       res.cookie('access_token', login.access_token_2fa.access_token, {
  //         httpOnly: true,
  //         secure: process.env.NODE_ENV === 'production',
  //         sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  //         maxAge: parseInt(process.env.ACCESS_TOKEN_EXPIRES_IN)
  //       });
  //
  //     }
  //
  //     if (login.refresh_token) {
  //
  //       res.cookie('refresh_token', login.refresh_token, {
  //         httpOnly: true,
  //         secure: process.env.NODE_ENV === 'production',
  //         sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  //         maxAge: parseInt(process.env.REFRESH_TOKEN_EXPIRES_IN)
  //       });
  //
  //     }
  //     return res.status(HttpStatus.OK).json(login);
  //   } catch (e) {
  //     return res.status(HttpStatus.BAD_REQUEST).json(e);
  //   }
  // }


  @Post('login/session')
  async loginSession(
    @Res() res,
    @Req() req,
    @Body() loginUserDto: LoginUserDto
  ) {
    try {

      const forwardedFor = req.headers['x-forwarded-for'];
      const userIp = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor?.split(',')[0]?.trim() || req.ip;
      const userAgent = req.headers['user-agent'] || 'unknown';

      console.log('userIp');
      console.log(userIp);


      if (req.cookies['access_token']) {
        res.clearCookie('access_token', {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
          maxAge: +process.env.ACCESS_TOKEN_EXPIRES_IN,
        });
      }

      if (req.cookies['refresh_token']) {
        res.clearCookie('refresh_token', {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
          maxAge: +process.env.REFRESH_TOKEN_EXPIRES_IN,
        });
      }

      const login: any = await this.authService.loginWithSessions(loginUserDto, userIp, userAgent);

      if (login.access_token) {
        res.cookie('access_token', login.access_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
          maxAge: parseInt(process.env.ACCESS_TOKEN_EXPIRES_IN)
        });
      }

      if (login.access_token_2fa) {

        res.cookie('access_token', login.access_token_2fa.access_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
          maxAge: parseInt(process.env.ACCESS_TOKEN_EXPIRES_IN)
        });

      }

      if (login.refresh_token) {

        res.cookie('refresh_token', login.refresh_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
          maxAge: parseInt(process.env.REFRESH_TOKEN_EXPIRES_IN)
        });

      }

      const sessionTtl = Number(process.env.SESSION_TTL);

      if (login.session_id) {
        res.cookie('session_id', login.session_id, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
          maxAge: sessionTtl * 1000,
        });
      }

      return res.status(HttpStatus.OK).json(login);
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json(e);
    }
  }


  // @UseGuards(SessionGuard)
  @Post('logout/session')
  async logoutSession(
    @Req() req,
    @Res() res
  )
  {
    try {
      const accessToken = req.cookies['access_token'];
      const refreshToken = req.cookies['refresh_token'];

      const logout = await this.authService.logout(accessToken, refreshToken);

      if (req.cookies['access_token']) {
        res.clearCookie('access_token');
      }

      if (req.cookies['refresh_token']) {
        res.clearCookie('refresh_token');
      }

      const destroySession = await this.sessionService.destroySession(req.cookies.session_id);
      if (req.cookies['session_id']) {
        res.clearCookie('session_id');
      }
      return res.status(HttpStatus.OK).json( { message: 'Logged out' });
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json(e);
    }
  }

  @Post('generate-otp/:id')
  async generateOtp(
    @Res() res,
    @Param('id') id: string,
    // @Body()  body: {action: Action}
  ) {
    try {
      const generateOtp = await this.authService.generateSendOtp(id, Action.Login);
      return res.status(HttpStatus.OK).json(generateOtp);
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json(e);
    }
  }

  @Post('otp-verify/:id')
  async otpSession(
    @Res() res,
    @Req() req,
    @Param('id') id: string,
    @Body() body: { otp: string},
  ) {
    try {
      const accessTokenCookie = req.cookies['access_token'];


      const forwardedFor = req.headers['x-forwarded-for'];
      const userIp = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor?.split(',')[0]?.trim() || req.ip;
      const userAgent = req.headers['user-agent'] || 'unknown';

      const verify: any = await this.authService.verifyOtpLoginSession(id, body.otp, Action.Login, accessTokenCookie, userIp, userAgent);

      if (verify.access_token) {

        res.cookie('access_token', verify.access_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
          maxAge: parseInt(process.env.ACCESS_TOKEN_EXPIRES_IN)
        });
      }

      if (verify.refresh_token) {

        res.cookie('refresh_token', verify.refresh_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
          maxAge: parseInt(process.env.REFRESH_TOKEN_EXPIRES_IN)
        });
      }

      const sessionTtl = Number(process.env.SESSION_TTL);

      if (verify.session_id) {
        res.cookie('session_id', verify.session_id, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
          maxAge: sessionTtl * 1000,
        });
      }

      return res.status(HttpStatus.OK).json(verify);
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json(e);
    }
  }

  //verify-otp non sessionlogin
  // @Post('verify-otp/:id')
  // async otp(
  //   @Res() res,
  //   @Req() req,
  //   @Param('id') id: string,
  //   @Body() body: { otp: string},
  // ) {
  //   try {
  //     const accessTokenCookie = req.cookies['access_token'];
  //
  //     const verify: any = await this.authService.verifyOtpLogin(id, body.otp, Action.Login, accessTokenCookie);
  //
  //     if (verify.access_token) {
  //
  //       res.cookie('access_token', verify.access_token, {
  //         httpOnly: true,
  //         secure: process.env.NODE_ENV === 'production',
  //         sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  //         maxAge: parseInt(process.env.ACCESS_TOKEN_EXPIRES_IN)
  //       });
  //     }
  //
  //     if (verify.refresh_token) {
  //
  //       res.cookie('refresh_token', verify.refresh_token, {
  //         httpOnly: true,
  //         secure: process.env.NODE_ENV === 'production',
  //         sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  //         maxAge: parseInt(process.env.REFRESH_TOKEN_EXPIRES_IN)
  //       });
  //     }
  //
  //     return res.status(HttpStatus.OK).json(verify);
  //   } catch (e) {
  //     return res.status(HttpStatus.BAD_REQUEST).json(e);
  //   }
  // }

  @UseGuards(RefreshTokenGuard)
  @Post('refresh-token')
  async refreshToken(@Req() req, @Res() res) {
    try {
      const refreshToken = req.cookies['refresh_token'];
      const { access_token } = await this.authService.refreshToken(refreshToken);

      res.cookie('access_token',access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: parseInt(process.env.ACCESS_TOKEN_EXPIRES_IN)
      });

      return res.status(HttpStatus.OK).json({access_token});
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json(e);
    }
  }

  @Post('check-token')
  async checkRefreshToken(@Req() req, @Res() res) {
    try {
      const refreshToken = req.cookies['refresh_token'];

      if (!refreshToken) {
        return res.status(HttpStatus.OK).json({ message: false });
      }
      const blacklistedToken = await TokenBlackListEntity.findOne({
        where: { token: refreshToken },
      });

      if (blacklistedToken) {
        throw new BadRequestException('Refresh token is blacklisted');
      }

      return res.status(HttpStatus.OK).json({ message: true });
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json(e);
    }
  }

  //logout non-session

  // @UseGuards(LoginGuard)
  // @Post('logout')
  // async logout(
  //   @Res() res,
  //   @Req() req,
  // ) {
  //   try {
  //     const accessToken = req.cookies['access_token'];
  //     const refreshToken = req.cookies['refresh_token'];
  //
  //     const logout = await this.authService.logout(accessToken, refreshToken);
  //
  //
  //     if (req.cookies['access_token']) {
  //       res.clearCookie('access_token');
  //     }
  //
  //     if (req.cookies['refresh_token']) {
  //       res.clearCookie('refresh_token');
  //     }
  //
  //     return res.status(200).json(logout);
  //   } catch (e) {
  //     return res.status(HttpStatus.BAD_REQUEST).json(e);
  //   }
  // }


  @Get('is-authenticated')
  async checkLoggedIn(
    @Res() res,
    @Req() req,
  ) {
    try {

      const accessToken = req.cookies.access_token;
      const refreshToken = req.cookies.refresh_token;

      if (!accessToken) {
        return res.status(HttpStatus.OK).json(false);
      }

      const blacklistedAccessToken = await TokenBlackListEntity.findOne({
        where: { token: accessToken },
      });

      if (blacklistedAccessToken) {
        console.log('Access token is blacklisted');
        return res.status(HttpStatus.OK).json(false);
      }

      const decodedAccessToken: any = jwt.verify(accessToken, process.env.SECRET_JWT);

      if (!decodedAccessToken) {
        console.log('Access token is invalid');
        return res.status(HttpStatus.OK).json(false);
      }

      const user = await UserEntity.findOne({ where: { id: decodedAccessToken.id } });

      console.log('user');
      console.log(user);

      if (!user) {
        console.log('User not found');
        return res.status(HttpStatus.OK).json(false);
      }

      if (decodedAccessToken._2fa_required === true) {
        console.log('2FA is enabled for this user');
        return res.status(HttpStatus.OK).json(false);
      }

      if (user.status === Status.Banned) {
        console.log('User is banned');
        return res.status(HttpStatus.OK).json(false);
      }

      if (decodedAccessToken.authenticate !== true) {
        return res.status(HttpStatus.OK).json(false);
      }

      if (!refreshToken) {
        return res.status(HttpStatus.OK).json(false);
      }

      // const blacklistedToken = await TokenBlackListEntity.findOne({
      //   where: { token: refreshToken },
      // });

      const blacklistedToken = await this.authService.findBlacklistedToken(refreshToken)

      if (blacklistedToken) {
        return res.status(HttpStatus.OK).json(false);
      }

      return res.status(HttpStatus.OK).json(true);
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json(e);
    }
  }

}
