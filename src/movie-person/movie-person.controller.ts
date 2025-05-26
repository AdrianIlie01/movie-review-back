import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  HttpStatus,
  NotFoundException,
  UseGuards
} from "@nestjs/common";
import { MoviePersonService } from './movie-person.service';
import { CreateMoviePersonDto } from './dto/create-movie-person.dto';
import { UpdateMoviePersonDto } from './dto/update-movie-person.dto';
import { LoginGuard } from "../auth/guards/login.guards";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";

@Controller('movie-person')
export class MoviePersonController {
  constructor(private readonly moviePersonService: MoviePersonService) {}

  @UseGuards(LoginGuard)
  @UseGuards(RolesGuard)
  @Roles('admin', 'moderator')
  @Post()
  async create(@Res() res, @Body() createDto: CreateMoviePersonDto) {
    try {
      const moviePerson = await this.moviePersonService.create(createDto);
      return res.status(HttpStatus.CREATED).json(moviePerson);
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json({ message: e.message });
    }
  }

  @UseGuards(LoginGuard)
  @UseGuards(RolesGuard)
  @Roles('admin', 'moderator')
  @Get()
  async findAll(@Res() res) {
    try {
      const moviePersons = await this.moviePersonService.findAll();
      return res.status(HttpStatus.OK).json(moviePersons);
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json({ message: e.message });
    }
  }

  @UseGuards(LoginGuard)
  @UseGuards(RolesGuard)
  @Roles('admin', 'moderator')
  @Get('id/:id')
  async findOne(@Res() res, @Param('id') id: string) {
    try {
      const moviePerson = await this.moviePersonService.findOne(id);
      return res.status(HttpStatus.OK).json(moviePerson);
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json({ message: e.message });
    }
  }

  @UseGuards(LoginGuard)
  @UseGuards(RolesGuard)
  @Roles('admin', 'moderator')
  @Patch('id/:id')
  async update(
    @Res() res,
    @Param('id') id: string,
    @Body() updateDto: UpdateMoviePersonDto,
  ) {
    try {
      const updatedMoviePerson = await this.moviePersonService.update(id, updateDto);
      return res.status(HttpStatus.OK).json(updatedMoviePerson);
    } catch (e) {
      if (e instanceof NotFoundException) {
        return res.status(HttpStatus.NOT_FOUND).json({ message: e.message });
      }
      return res.status(HttpStatus.BAD_REQUEST).json({ message: e.message });
    }
  }

  @UseGuards(LoginGuard)
  @UseGuards(RolesGuard)
  @Roles('admin', 'moderator')
  @Delete('id/:id')
  async remove(@Res() res, @Param('id') id: string) {
    try {
      const result = await this.moviePersonService.remove(id);
      return res.status(HttpStatus.OK).json(result);
    } catch (e) {
      if (e instanceof NotFoundException) {
        return res.status(HttpStatus.NOT_FOUND).json({ message: e.message });
      }
      return res.status(HttpStatus.BAD_REQUEST).json({ message: e.message });
    }
  }
}