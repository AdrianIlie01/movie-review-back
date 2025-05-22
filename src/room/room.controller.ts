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
  UploadedFile, Req
} from "@nestjs/common";
import { RoomService } from './room.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { CreateRatingDto } from "../rating/dto/create-rating.dto";
import { MovieType } from "../shared/movie-type";

@Controller('room')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

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

  // @UseGuards(LoginGuard)
  // @UseGuards(RolesGuard)
  // @Roles('admin')
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

  @Patch('id/:id')
  async update(@Res() res, @Param('id') id: string, @Body() updateRoomDto: UpdateRoomDto) {
    try {
      const room = await this.roomService.update(id, updateRoomDto)
      return res.status(HttpStatus.CREATED).json(room);
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json(e);
    }
  }

  @Patch('add-type/:id')
  async addType(@Res() res, @Param('id') id: string, @Body() body:{type: MovieType[]}) {
    try {
      const room = await this.roomService.addTypeToMovie(id,body.type )
      return res.status(HttpStatus.CREATED).json(room);
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json(e);
    }
  }

  @Patch('remove-type/:id')
  async removeType(@Res() res, @Param('id') id: string, @Body() body:{type: MovieType[]}) {
    try {
      const room = await this.roomService.removeTypeFromMovie(id,body.type )
      return res.status(HttpStatus.CREATED).json(room);
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json(e);
    }
  }


  @Delete('id/:id')
 async remove(@Res() res, @Param('id') id: string) {
    try {
      const room = await this.roomService.remove(id)
      return res.status(HttpStatus.CREATED).json(room);
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json(e);
    }
  }
}
