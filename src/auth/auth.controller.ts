import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpStatus, Ip,
  Param,
  Post,
  Req,
  Res,
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

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly sessionService: SessionService
    ) {}


  // todo Logare: 2fa - cu access_token && refresh_token - fara sesiuni
  @Post('login')
  async login(
    @Res() res,
    @Req() req,
    @Body() loginUserDto: LoginUserDto
  ) {
    try {
      // din frontend stergem access_token && refresh_token existente
      // 1. pt login completa setam atat: access_token cat si refresh_token
      // 2. pt login cu 2fa: true - setam doar access_token - cu o proprietate ce spune ca 2fa: true

      // cand verificam daca userul e logat - cautam in cookies si validam jwt lor atat pentru:
      // access_token cat si pt refresh_token

      if (req.cookies['access_token']) {
        res.clearCookie('access_token', {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'none',
          maxAge: +process.env.ACCESS_TOKEN_EXPIRES_IN,
        });
      }

      if (req.cookies['refresh_token']) {
        res.clearCookie('refresh_token', {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'none',
          maxAge: +process.env.REFRESH_TOKEN_EXPIRES_IN,
        });
      }

      const login: any = await this.authService.login(loginUserDto);

      console.log('login');
      console.log(login);

      if (login.access_token) {
        console.log('parseInt(process.env.ACCESS_TOKEN_EXPIRES_IN)');
        console.log(parseInt(process.env.ACCESS_TOKEN_EXPIRES_IN));
        res.cookie('access_token', login.access_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: parseInt(process.env.ACCESS_TOKEN_EXPIRES_IN)
        });
        console.log('cookie set');
        console.log(res.cookie.access_token);
      }

      if (login.access_token_2fa) {
        console.log('ok ?');

        console.log(login.access_token_2fa.access_token);



        console.log('efore setting access token for 2fa');

        res.cookie('access_token', login.access_token_2fa.access_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: parseInt(process.env.ACCESS_TOKEN_EXPIRES_IN)
        });

        console.log('cookie set with 2fa');


      }

      if (login.refresh_token) {

        res.cookie('refresh_token', login.refresh_token, {
          httpOnly: true, // Protejează cookie-ul de atacuri XSS
          secure: process.env.NODE_ENV === 'production', // Folosește ternary operator pentru a seta secure
          maxAge: parseInt(process.env.REFRESH_TOKEN_EXPIRES_IN)
        });

        console.log(res.cookie.refresh_token);
        console.log('cookie set');

      }

      console.log('finish login');

      return res.status(HttpStatus.OK).json(login);
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json(e);
    }
  }


  //todo login - cu session ids

  @Post('login/session')
  async loginSession(
    @Res() res,
    @Req() req,
    @Ip() ipNest,
    @Body() loginUserDto: LoginUserDto
  ) {
    try {
      console.log(process.env.REDIS_URL);

      const ip = req.ip;

      console.log(ip);

      console.log('ipNest');
      console.log(ipNest);

      // in local host toate vor fi ::1

      // from my vercel app i get
      //  "ip": "127.0.0.1",
      //  "ipNest": "127.0.0.1"
      //todo ip&& ipNest - sunt ip-urile de la masina locala

      // "userIp": "213.157.191.137"


      const forwardedFor = req.headers['x-forwarded-for'];
      const userIp = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor?.split(',')[0]?.trim() || req.ip;
      console.log('User IP:', userIp);

      const userAgent = req.headers['user-agent'] || 'unknown';

      console.log(typeof userAgent);
      console.log(typeof userIp);


      const login: any = await this.authService.loginWithSessions(loginUserDto, userIp, userAgent);

      // return res.status(HttpStatus.OK).json({
      //   ip: ip,
      //   inNest: ipNest,
      //   userIp: userIp,
      //   userAgent: userAgent
      // });

      const sessionTtl = Number(process.env.SESSION_TTL);

      res.cookie('sessionId', login, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: sessionTtl * 1000,
      });


      // todo creaza  cookiul csrf cu expiration
      const csrfToken = crypto.randomBytes(32).toString('hex');
      res.cookie('csrf-token', csrfToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',  // Se trimite doar pe HTTPS în producție
        sameSite: 'none',
        maxAge: sessionTtl * 1000,
      });

      return res.status(HttpStatus.OK).json(login);
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json(e);
    }
  }


  @Post('logout-session')
  @UseGuards(SessionGuard)
  async logoutSession(
    @Req() req,
    @Res() res
  )
  {
    try {
      const destroySession = await this.sessionService.destroySession(req.cookies.sessionId);
      res.clearCookie('sessionId');

      return res.status(HttpStatus.OK).json( { message: 'Logged out' });
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json(e);
    }
  }



  // @Roles('user')
  @UseGuards(SessionGuard)
  @UseGuards(CsrfGuard)
  @Post('verify-session')
  async verifySession(
    @Res() res,
    @Req() req,
  ) {
    try {
      console.log('also in headers implements csrf protection');
      return res.status(200).json('Session works protected');
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json(e);
    }
  }

  @Get('csrf-token')
  getCsrfToken(@Req() req) {
    return { csrfToken: (req as any).csrfToken };
  }

  @Post('generate-otp/:id')
  async generateOtp(
    @Res() res,
    @Param('id') id: string,
    // @Body()  body: {action: Action}
  ) {
    try {
      //todo asta e functie folosita pt a trimtie otp pt login, deci nu mai punem pe body action

      // const generateOtp = await this.authService.generateSendOtp(id, body.action);
      const generateOtp = await this.authService.generateSendOtp(id, Action.Login);
      return res.status(HttpStatus.OK).json(generateOtp);
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json(e);
    }
  }

  @Post('otp-verify/:id')
  async otp2(
    @Res() res,
    @Req() req,
    @Param('id') id: string,
    @Body() body: { otp: string},
  ) {
    try {
      const accessTokenCookie = req.cookies['access_token'];

      const verify: any = await this.authService.verifyOtpLogin(id, body.otp, Action.Login, accessTokenCookie);

      if (verify.access_token) {
        res.cookie('access_token', verify.access_token, {
          httpOnly: true, // Protejează cookie-ul de atacuri XSS
          secure: process.env.NODE_ENV === 'production', // Folosește ternary operator pentru a seta secure
          sameSite: 'none',
          maxAge: parseInt(process.env.ACCESS_TOKEN_EXPIRES_IN)
        });
      }

      if (verify.refresh_token) {
        res.cookie('refresh_token', verify.refresh_token, {
          httpOnly: true, // Protejează cookie-ul de atacuri XSS
          secure: process.env.NODE_ENV === 'production', // Folosește ternary operator pentru a seta secure
          sameSite: 'none',
          maxAge: parseInt(process.env.REFRESH_TOKEN_EXPIRES_IN)
        });
      }
      return res.status(HttpStatus.OK).json(verify);
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json(e);
    }
  }

  @UseGuards(RefreshTokenGuard)
  @Post('refresh-token')
  async refreshToken(@Req() req, @Res() res) {
    try {
      const refreshToken = req.cookies['refresh_token'];
      const { access_token } = await this.authService.refreshToken(refreshToken);

      res.cookie('access_token',access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'none',
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

  @UseGuards(RolesGuard)
  @Roles('user', 'admin')
  // @Roles('user')
  @UseGuards(LoginGuard)
  @Post('verify')
  async verify(
    @Res() res,
    @Req() req,
  ) {
    try {
      return res.status(200).json('works protected');
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json(e);
    }
  }

  @UseGuards(LoginGuard)
  @Post('logout')
  async logout(
    @Res() res,
    @Req() req,
  ) {
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

      return res.status(200).json(logout);
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json(e);
    }
  }

  // cand verificam daca userul e logat - cautam in cookies
  // si validam jwt lor atat pentru:
  // access_token cat si pt refresh_token
  @Get('is-authenticated')
  async checkLoggedIn(
    @Res() res,
    @Req() req,
  ) {
    try {
      // if (!req.user) {
      //   throw new UnauthorizedException('Token invalid');
      // }
//todo
// aici trebuia sa validez cookie-ul daca e valid, daca u e black lsited la fel ca in LoginStrategy



      // login cu 2fa: true = seteaza doar access_token
      const jwt1 = req.cookies.access_token;
      const jwt2 = req.cookies.refresh_token;

      console.log('e logat ?');
      console.log(jwt1, jwt2);

      if (jwt1 && jwt2) {
        return res.status(HttpStatus.OK).json(true);
      } else {
        return res.status(HttpStatus.OK).json(false);
      }

      // return res.status(200).json(req.user);
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json(e);
    }
  }

}
