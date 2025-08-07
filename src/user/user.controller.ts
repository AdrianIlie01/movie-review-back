import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  BadRequestException,
  HttpStatus,
  Res, Req, UseGuards, Query, ParseIntPipe
} from "@nestjs/common";
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginGuard } from "../auth/guards/login.guards";
import { ChangeEmailDto } from "./dto/change-email.dto";
import { ResetForgottenPasswordDto } from "./dto/reset-forgotten-password.dto";
import { UpdatePasswordDto } from "./dto/update-password.dto";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { ChangeRoleDto } from "./dto/change-role.dto";
import { IdGuard } from "../auth/guards/id-guard.service";

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  async create(
    @Res() res,
    @Body() createUserDto: CreateUserDto) {
    try {
      const user = await this.userService.create(createUserDto);
      return res.status(HttpStatus.OK).json(user);
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json(e);
    }
  }

  @Get('get-user')
  async getUserInfoByReq(
    @Res() res,
    @Req() req ) {
    try {
      const token = req;
      if (req.cookies && req.cookies.access_token) {
        const token = req.cookies.access_token;
        const decodedToken: any = await this.userService.decodeToken(token);
        const user = await this.userService.findOne(decodedToken.id);

        if (user) {
          const token = {
            id: user.id,
            _2fa: user.is_2_fa_active,
            username: user.username,
            email: user.email,
            create_date: user.create_date,
            roles: user.role,
            status: user.status,
            authenticate: decodedToken.authenticate,
            iat: decodedToken.iat,
            exp: decodedToken.exp
          }

          if (user.status === 'banned') {
            throw new BadRequestException('User is banned');
          }

          return res.status(HttpStatus.OK).json(token);
        }

        return res.status(HttpStatus.OK).json(decodedToken);

      } else {
        return res.status(HttpStatus.UNAUTHORIZED).json({ message: "Unauthorized: access_token missing" });
      }
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json(e);
    }
  }

  @UseGuards(LoginGuard)
  @UseGuards(IdGuard)
  @Patch('/update-pass-log/:id')
  async updatePasswordLoggedIN(
    @Res() res,
    @Param('id') id: string,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ) {
    try {
      const user = await this.userService.updatePasswordLoggedIn(
        id,
        updatePasswordDto,
      );
      return res.status(HttpStatus.OK).json(user);
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json(e);
    }
  }

  @Patch('reset-forgotten-password')
  async resetPassword(
    @Res() res,
    @Body() resetForgottenPassword: ResetForgottenPasswordDto,
  ) {
    try {
      const ip = 'ip';
      const reset = await this.userService.resetPassword(
        resetForgottenPassword,
        ip,
      );

      return res.status(HttpStatus.OK).json(reset);
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json(e);
    }
  }

  @UseGuards(LoginGuard)
  @UseGuards(RolesGuard)
  @Roles('admin', 'moderator')
  @Get()
  async  findAll(
    @Res() res,
  ) {
    try {
      const users = await this.userService.findAll();
      return res.status(HttpStatus.OK).json(users);
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json(e);
    }
  }
  @UseGuards(LoginGuard)
  @UseGuards(RolesGuard)
  @Roles('admin', 'moderator')
  @Get('paginated')
  async  findAllPaginated(
    @Res() res,
    @Req() req,
    @Query('limit', new ParseIntPipe()) limit: number = 10,
    @Query('offset', new ParseIntPipe()) offset: number = 0
  ) {
    try {
      const currentUserId = req.user.decodedAccessToken.id;
      const users = await this.userService.findAllPaginated(limit, offset, currentUserId);
      return res.status(HttpStatus.OK).json(users);
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json(e);
    }
  }
  @Get('date')
  async  getDate(
    @Res() res,
  ) {
    try {
      const date = new Date();
      return res.status(HttpStatus.OK).json(date);
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json(e);
    }
  }

  @UseGuards(LoginGuard)
  @Get(':id')
  async findOne(
    @Res() res,
    @Param('id') id: string
  ) {
    try {
      const user = await this.userService.findOne(id);
      return res.status(HttpStatus.OK).json(user);
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json(e);
    }
  }

  @Get('check-email-availability/:email')
  async  findByEmail(
    @Res() res,
    @Param('email') email: string
  ) {
    try {
      const check = await this.userService.checkEmailAvailability(email);
      return res.status(HttpStatus.OK).json(check);
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json(e);
    }
  }

  @Get('check-username-availability/:username')
  async  findByName(
    @Res() res,
    @Param('username') username: string
  ) {
    try {
      const check = await this.userService.checkUsernameAvailability(username);
      return res.status(HttpStatus.OK).json(check);
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json(e);
    }
  }
  @UseGuards(LoginGuard)
  @Post('enableDisable2fa/:id')
  async enable2fa(@Res() res, @Param('id') id: string) {
    try {
      const user = await this.userService.enableDisable2fa(id);
      return res.status(HttpStatus.CREATED).json(user);
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json(e);
    }
  }

  @UseGuards(LoginGuard)
  @UseGuards(RolesGuard)
  @Roles('admin')
  @Patch('/change-role/:id')
  // an admin can make a user admin, moderator
  async changeUserRole(@Res() res, @Body() changeStatus: ChangeRoleDto,
                       @Param('id') id: string,
  ) {
    try {
      const user = await this.userService.changeRole(changeStatus, id);
      return res.status(HttpStatus.OK).json(user);
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json(e);
    }
  }

  @UseGuards(LoginGuard)
  @UseGuards(IdGuard)
  @Patch(':id')
  async update(
    @Res() res,
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto
  ) {
    try {
      const user = await this.userService.update(id, updateUserDto);
      return res.status(HttpStatus.OK).json(user);
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json(e);
    }
  }

  @UseGuards(LoginGuard)
  @UseGuards(RolesGuard)
  @Roles('admin', 'moderator')
  @Patch('ban-user/:id')
  async banUser(
    @Res() res,
    @Param('id') id: string,
  ) {
    try {
      const user = await this.userService.banUser(id);
      return res.status(HttpStatus.OK).json(user);
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json(e);
    }
  }

  @UseGuards(LoginGuard)
  @UseGuards(RolesGuard)
  @Roles('admin', 'moderator')
  @Patch('unban-user/:id')
  async unBanUser(
    @Res() res,
    @Param('id') id: string,
  ) {
    try {
      const user = await this.userService.unBanUser(id);
      return res.status(HttpStatus.OK).json(user);
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json(e);
    }
  }

  @UseGuards(LoginGuard)
  @UseGuards(IdGuard)
  @Post('send-otp-change-email/:id')
  async sendOtpChangeEmail(@Res() res, @Req() req, @Param('id') id: string) {
    try {
      const forwardedFor = req.headers['x-forwarded-for'];
      const userIp = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor?.split(',')[0]?.trim() || req.ip;
      const email = await this.userService.sendOtpChangeEmail(id, userIp);

      return res.status(HttpStatus.OK).json(email);
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json(e);
    }
  }

  @UseGuards(LoginGuard)
  @UseGuards(IdGuard)
  @Patch('change-email/:id')
  async changeEmail(
    @Res() res,
    @Param('id') id: string,
    @Body() changeEmail: ChangeEmailDto,
    // after the otp was sent => 2 fields: otp for verification + new email
  ) {
    try {
      const ip = 'ip';
      const user = await this.userService.changeEmail(id, changeEmail, ip);
      return res.status(HttpStatus.OK).json(user);
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json(e);
    }
  }

  @Post('send-otp-reset-password')
  async sendOtpChangePassword(
    @Res() res,
    @Req() req,
    @Body('userIdentifier') userIdentifier: string,
  ) {
    try {
      const forwardedFor = req.headers['x-forwarded-for'];
      const userIp = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor?.split(',')[0]?.trim() || req.ip;
      const reset = await this.userService.sendEmailResetPassword(
        userIdentifier,
        userIp,
      );

      return res.status(HttpStatus.OK).json(reset);
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json(e);
    }
  }

  @UseGuards(LoginGuard)
  @UseGuards(IdGuard)
  @Delete(':id')
  async remove(
    @Res() res,
    @Param('id') id: string
  ) {
    try {
      const user = await this.userService.remove(id);
      return res.status(HttpStatus.OK).json(user);
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json(e);
    }
  }
}
