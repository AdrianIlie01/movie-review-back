import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus, Res, UseGuards } from "@nestjs/common";
import { UserInfoService } from './user-info.service';
import { CreateUserInfoDto } from './dto/create-user-info.dto';
import { UpdateUserInfoDto } from './dto/update-user-info.dto';
import { LoginGuard } from "../auth/guards/login.guards";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";

@Controller('user-info')
export class UserInfoController {
  constructor(private readonly userInfoService: UserInfoService) {}

  @UseGuards(LoginGuard)
  @Post(':id')
  async create(
    @Res() res,
    @Body() createUserInfoDto: CreateUserInfoDto,
    @Param('id') id: string)
{
    try {
      const userInfo = await this.userInfoService.create(createUserInfoDto, id);
      return res.status(HttpStatus.OK).json(userInfo);
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json(e);
    }

  }

  @UseGuards(LoginGuard)
  @UseGuards(RolesGuard)
  @Roles('admin')
  @Get()
  async findAll(
    @Res() res
  ) {
    try {
      const info = await this.userInfoService.findAll();
      return res.status(HttpStatus.OK).json(info);
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json(e);
    }
  }

  @UseGuards(LoginGuard)
  @Get(':id')
  async findOne(
    @Res() res,
    @Param('id') id: string)
  {
    try {
      const info = await this.userInfoService.findOne(id);
      return res.status(HttpStatus.OK).json(info);
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json(e);
    }
  }

  @UseGuards(LoginGuard)
  @Get('phone/:phone')
  async findOneByPhone(
    @Res() res,
    @Param('phone') phone: string)
  {
    try {
      const info = await this.userInfoService.findByPhone(phone);
      return res.status(HttpStatus.OK).json(info);
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json(e);
    }
  }

  @UseGuards(LoginGuard)
  @Get('user/:id')
  async findOneByUser(
    @Res() res,
    @Param('id') id: string)
  {
    try {
      const info = await this.userInfoService.findOneByUser(id);
      return res.status(HttpStatus.OK).json(info);
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json(e);
    }
  }

  @UseGuards(LoginGuard)
  @Patch(':id')
  async update(
    @Res() res,
    @Param('id') id: string,
    @Body() updateUserInfoDto: UpdateUserInfoDto)
  {
    try {
      const info = await this.userInfoService.update(id, updateUserInfoDto);
      return res.status(HttpStatus.OK).json(info);
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json(e);
    }
  }

  @UseGuards(LoginGuard)
  @Delete(':id')
  async remove(
    @Res() res,
    @Param('id') id: string) {
    try {
      const info = await this.userInfoService.remove(id);
      return res.status(HttpStatus.OK).json(info);
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json(e);
    }
  }
}
