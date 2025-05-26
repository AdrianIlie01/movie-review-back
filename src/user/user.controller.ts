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
  Res, Req, UseGuards
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
      console.log('req');
      console.log(req.cookies);

      if (req.cookies && req.cookies.access_token) {
        console.log('no ?');
        const token = req.cookies.access_token;
        const decodedToken = await this.userService.decodeToken(token);

        console.log('returnam JWT PAYLOAD - user has ACCESS_TOKEN');
        return res.status(HttpStatus.OK).json(decodedToken);

      } else {
        console.log('nu are cookeis access_token => aunoth access');
        return res.status(HttpStatus.UNAUTHORIZED).json({ message: "Unauthorized: access_token missing" });
      }
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json(e);
    }
  }

  @UseGuards(LoginGuard)
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

  @UseGuards(LoginGuard)
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
    @Body('userIdentifier') userIdentifier: string,
  ) {
    try {
      const ip = 'ip';
      const reset = await this.userService.sendEmailResetPassword(
        userIdentifier,
        ip,
      );

      return res.status(HttpStatus.OK).json(reset);
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json(e);
    }
  }

  @UseGuards(LoginGuard)
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
