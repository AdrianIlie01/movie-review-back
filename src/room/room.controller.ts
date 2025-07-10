import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Res,
  HttpStatus,
  UploadedFile, Req, Query
} from "@nestjs/common";
import { RoomService } from './room.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { CreateRatingDto } from "../rating/dto/create-rating.dto";
import { MovieType } from "../shared/movie-type";
import { LoginGuard } from "../auth/guards/login.guards";
import { IdGuard } from "../auth/guards/id-guard.service";
import { FilterMovies } from "../shared/filter-movies";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";

@Controller('room')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}


  @UseGuards(LoginGuard)
  @UseGuards(RolesGuard)
  @Roles('admin', 'moderator')
  @Post()
  async create(
   @Res() res,
   // @UploadedFile() file: Express.Multer.File,
   @Body() createRoomDto: CreateRoomDto
  ){
    try {
      const room = await this.roomService.create(createRoomDto);
      console.log('room ctroller', room);
      return res.status(HttpStatus.CREATED).json(room);
    } catch (e) {
      // if (file) {
      //   const filePath = join(imagePath, file.filename);
      //   await unlinkSync(filePath);
      // }
      return res.status(HttpStatus.BAD_REQUEST).json(e);
    }
  }


  @Get('check-name-availability/:name')
  async  checkName(
    @Res() res,
    @Param('name') name: string
  ) {
    try {
      const check = await this.roomService.checkNameAvailability(name);
      return res.status(HttpStatus.OK).json(check);
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json(e);
    }
  }

  @Get('check-name-edit-availability/:name/:id')
  async  checkEditName(
    @Res() res,
    @Param('name') name: string,
    @Param('id') id: string
  ) {
    try {
      const check = await this.roomService.checkNameEditAvailability(name, id);
      return res.status(HttpStatus.OK).json(check);
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json(e);
    }
  }



  @UseGuards(LoginGuard)
  @Get('name/:name')
  async getRoom(@Res() res, @Param('name') name: string) {
    try {
      const room = await this.roomService.findByName(name);
      return res.status(HttpStatus.CREATED).json(room);
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json(e);
    }
  }

  @Get()
  async findAll(@Res() res) {
    try {
      const room = await this.roomService.findAll();
      return res.status(HttpStatus.CREATED).json(room);
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json(e);
    }
  }

  @UseGuards(LoginGuard)
  @Get('id/:id')
  async findOne(@Res() res, @Param('id') id: string) {
    try {
      console.log('find by id');
      const room = await this.roomService.findOne(id);
      return res.status(HttpStatus.CREATED).json(room);
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json(e);
    }
  }

  @UseGuards(LoginGuard)
  @Get('type/:type')
  async findByType(@Res() res, @Param('type') type: string) {
    try {
      console.log('find by type');
      const room = await this.roomService.findByType(type);
      return res.status(HttpStatus.CREATED).json(room);
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json(e);
    }
  }

  @UseGuards(LoginGuard)
  @Get('filter')
  async filter(@Res() res, @Query() query: FilterMovies) {
    try {
      const filter = await this.roomService.filterMovies(query);
      return res.status(HttpStatus.CREATED).json(filter);
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json(e);
    }
  }

  @UseGuards(LoginGuard)
  @UseGuards(RolesGuard)
  @Roles('admin', 'moderator')
  @Patch('id/:id')
  async update(@Res() res, @Param('id') id: string, @Body() updateRoomDto: UpdateRoomDto) {
    try {
      console.log('a');
      const room = await this.roomService.update(id, updateRoomDto)
      return res.status(HttpStatus.CREATED).json(room);
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json(e);
    }
  }

  @UseGuards(LoginGuard)
  @UseGuards(RolesGuard)
  @Roles('admin', 'moderator')
  @Patch('add-type/:id')
  async addType(@Res() res, @Param('id') id: string, @Body() body:{type: MovieType[]}) {
    try {
      const room = await this.roomService.addTypeToMovie(id,body.type )
      return res.status(HttpStatus.CREATED).json(room);
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json(e);
    }
  }

  @UseGuards(LoginGuard)
  @UseGuards(RolesGuard)
  @Roles('admin', 'moderator')
  @Patch('remove-type/:id')
  async removeType(@Res() res, @Param('id') id: string, @Body() body:{type: MovieType[]}) {
    try {
      const room = await this.roomService.removeTypeFromMovie(id,body.type )
      return res.status(HttpStatus.CREATED).json(room);
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json(e);
    }
  }

  @UseGuards(LoginGuard)
  @UseGuards(RolesGuard)
  @Roles('admin', 'moderator')
  @Delete('id/:id')
 async remove(@Res() res, @Param('id') id: string) {
    try {
      const room = await this.roomService.remove(id)
      return res.status(HttpStatus.CREATED).json(room);
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json(e);
    }
  }

  @Get('default-theme-thumbnail/:name')
  async getDefaultThumbnail(@Res() res, @Param('name') name: string)  {
    try {
      res.sendFile(name, { root: 'uploaded-images' });
      // return res.status(HttpStatus.CREATED).json(thumbnail);
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json(e);
    }
  }

  @Get('thumbnail/:name')
  async getThumbnail(@Res() res, @Param('name') name: string) {
    try {
      res.sendFile(name, { root: 'uploaded-images' });
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json(e);
    }
  }

}
