import { Controller, Get, Post, Body, Patch, Param, Delete, Res, HttpStatus, UseGuards } from "@nestjs/common";
import { FirebaseService } from './firebase.service';
import { CreateFirebaseDto } from './dto/create-firebase.dto';
import { UpdateFirebaseDto } from './dto/update-firebase.dto';
import { LoginGuard } from "../auth/guards/login.guards";
import { IdGuard } from "../auth/guards/id-guard.service";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";

@Controller('firebase')
export class FirebaseController {
  constructor(private readonly firebaseService: FirebaseService) {}

  @UseGuards(LoginGuard)
  @Post()
  create(@Res() res,
         @Body() createFirebaseDto: CreateFirebaseDto) {
    try {
      return res.status(HttpStatus.OK).json('firebase');
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json(e);
    }
  }

  @UseGuards(LoginGuard)
  @Get()
  findAll() {
    return this.firebaseService.findAll();
  }

  @UseGuards(LoginGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.firebaseService.findOne(+id);
  }

  @UseGuards(LoginGuard)
  @UseGuards(IdGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFirebaseDto: UpdateFirebaseDto) {
    return this.firebaseService.update(+id, updateFirebaseDto);
  }

  @UseGuards(LoginGuard)
  @UseGuards(RolesGuard)
  @Roles('admin', 'moderator')
  @Patch('admin/update/:id')
  updateComment(@Param('id') id: string, @Body() updateFirebaseDto: UpdateFirebaseDto) {
    return this.firebaseService.update(+id, updateFirebaseDto);
  }

  @UseGuards(LoginGuard)
  @UseGuards(IdGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.firebaseService.remove(+id);
  }

  @UseGuards(LoginGuard)
  @UseGuards(RolesGuard)
  @Roles('admin', 'moderator')  @Delete('admin/delete/:id')
  removeComment(@Param('id') id: string) {
    return this.firebaseService.remove(+id);
  }
}
