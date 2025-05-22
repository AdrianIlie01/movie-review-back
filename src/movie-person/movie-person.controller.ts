import { Controller, Get, Post, Body, Patch, Param, Delete, Res, HttpStatus, NotFoundException } from "@nestjs/common";
import { MoviePersonService } from './movie-person.service';
import { CreateMoviePersonDto } from './dto/create-movie-person.dto';
import { UpdateMoviePersonDto } from './dto/update-movie-person.dto';

@Controller('movie-person')
export class MoviePersonController {
  constructor(private readonly moviePersonService: MoviePersonService) {}

  @Post()
  async create(@Res() res, @Body() createDto: CreateMoviePersonDto) {
    try {
      const moviePerson = await this.moviePersonService.create(createDto);
      return res.status(HttpStatus.CREATED).json(moviePerson);
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json({ message: e.message });
    }
  }

  @Get()
  async findAll(@Res() res) {
    try {
      const moviePersons = await this.moviePersonService.findAll();
      return res.status(HttpStatus.OK).json(moviePersons);
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json({ message: e.message });
    }
  }

  @Get('id/:id')
  async findOne(@Res() res, @Param('id') id: string) {
    try {
      const moviePerson = await this.moviePersonService.findOne(id);
      return res.status(HttpStatus.OK).json(moviePerson);
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json({ message: e.message });
    }
  }

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