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
import { AddPersonsSingleRoleToMovieDto } from "./dto/add-persons-single-role-to-movie.dto";
import { MoviePersonRole } from "../shared/movie-person-role";
import { AddRolesPersonForMovieDto } from "./dto/add-roles-person-for-movie.dto";
import { AddMultipleRolesPerMovieDto } from "./dto/add-multiple-roles-per-movie.dto";

@Controller('movie-person')
export class MoviePersonController {
  constructor(private readonly moviePersonService: MoviePersonService) {}


  // add or remove persons with a single role to a movie
  @UseGuards(LoginGuard)
  @UseGuards(RolesGuard)
  @Roles('admin', 'moderator')
  @Post('movie/:roomId/:role')
  async managePersonPerRolePerMovie(
    @Res() res,
    @Param('roomId') roomId: string,
    @Param('role') role: MoviePersonRole,
    @Body() dto: AddPersonsSingleRoleToMovieDto) {
    try {
      const moviePerson = await this.moviePersonService.managePersonPerRolePerMovie(roomId, role, dto);
      return res.status(HttpStatus.CREATED).json(moviePerson);
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json({ message: e.message });
    }
  }

  @UseGuards(LoginGuard)
  @UseGuards(RolesGuard)
  @Roles('admin', 'moderator')
  @Post('person/:personId/:role')
  async managePersonMoviesPerRole(
    @Res() res,
    @Param('personId') personId: string,
    @Param('role') role: MoviePersonRole,
    @Body() dto: AddRolesPersonForMovieDto) {
    try {
      const moviePerson = await this.moviePersonService.managePersonMoviesPerRole(personId, role, dto);
      return res.status(HttpStatus.CREATED).json(moviePerson);
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json({ message: e.message });
    }
  }

  // add or remove roles for a person in a movie
  @UseGuards(LoginGuard)
  @UseGuards(RolesGuard)
  @Roles('admin', 'moderator')
  @Post('person-roles/:roomId/:personId')
  async managePersonRolesPerMovie(
    @Res() res,
    @Param('roomId') roomId: string,
    @Param('personId') personId: string,
    @Body() dto: AddRolesPersonForMovieDto) {
    try {
      const moviePerson = await this.moviePersonService.managePersonRolesPerMovie(roomId, personId, dto);
      return res.status(HttpStatus.CREATED).json(moviePerson);
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json({ message: e.message });
    }
  }

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
  @Get('cast/movie/:movieId')
  async findCastByMovie(@Res() res, @Param('movieId') movieId: string) {
    try {
      const moviePerson = await this.moviePersonService.findCastByMovie(movieId);
      return res.status(HttpStatus.OK).json(moviePerson);
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json({ message: e.message });
    }
  }

  @UseGuards(LoginGuard)
  @UseGuards(RolesGuard)
  @Roles('admin', 'moderator')
  @Get('movie/:personId/:role')
  async findMoviesByPersonRole(
    @Res() res,
    @Param('personId') personId: string,
    @Param('role') role: MoviePersonRole,
  ) {
    try {
      const moviePerson = await this.moviePersonService.findMoviesByPersonRole(personId, role);
      return res.status(HttpStatus.OK).json(moviePerson);
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json({ message: e.message });
    }
  }

  @UseGuards(LoginGuard)
  @UseGuards(RolesGuard)
  @Roles('admin', 'moderator')
  @Get('cast/movie/:movieId/:role')
  async findCastByMovieAndRole(
    @Res() res,
    @Param('movieId') movieId: string,
    @Param('role') role: MoviePersonRole,
  ) {
    try {
      const moviePerson = await this.moviePersonService.findCastByMovieAndRole(movieId, role);
      return res.status(HttpStatus.OK).json(moviePerson);
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json({ message: e.message });
    }
  }

  @UseGuards(LoginGuard)
  @UseGuards(RolesGuard)
  @Roles('admin', 'moderator')
  @Post('add-roles/person/:personId')
  async addPersonRolesToMovie(
    @Res() res,
    @Param('personId') personId: string,
    @Body() body: AddMultipleRolesPerMovieDto,
  ) {
    try {
      const moviePerson = await this.moviePersonService.addPersonRolesToMovie(personId, body);
      return res.status(HttpStatus.OK).json(moviePerson);
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json({ message: e.message });
    }
  }

  @UseGuards(LoginGuard)
  @UseGuards(RolesGuard)
  @Roles('admin', 'moderator')
  @Post('add-cast/movie/:movieId/')
  async addPersonsToRoleInMovie(
    @Res() res,
    @Param('movieId') movieId: string,
    @Body() body: AddPersonsSingleRoleToMovieDto,
  ) {
    try {
      const moviePerson = await this.moviePersonService.addPersonsToRoleInMovie(movieId, body);
      return res.status(HttpStatus.OK).json(moviePerson);
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json({ message: e.message });
    }
  }

  @UseGuards(LoginGuard)
  @UseGuards(RolesGuard)
  @Roles('admin', 'moderator')
  @Get(':personId/movies')
  async findMoviesByPerson(@Res() res, @Param('personId') personId: string) {
    try {
      const moviePerson = await this.moviePersonService.findMoviesByPerson(personId);
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