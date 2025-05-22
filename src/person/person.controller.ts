import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus, Res, Query } from "@nestjs/common";
import { PersonService } from './person.service';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';
import { MoviePersonRole } from "../shared/movie-person-role";
import { FilterMovies } from "../shared/filter-movies";

@Controller('person')
export class PersonController {
  constructor(private readonly personService: PersonService) {}

  @Post()
  async create(@Res() res, @Body() createPersonDto: CreatePersonDto) {
    try {
      const person = await this.personService.create(createPersonDto);
      return res.status(HttpStatus.CREATED).json(person);
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json({ message: e.message });
    }
  }

  @Get('filter')
  async filter(@Res() res, @Query() query: FilterMovies) {
    try {
      const filter = await this.personService.filterPerson(query);
      return res.status(HttpStatus.CREATED).json(filter);
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json(e);
    }
  }
  @Get()
  async findAll(@Res() res) {
    try {
      const people = await this.personService.findAll();
      return res.status(HttpStatus.OK).json(people);
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json({ message: e.message });
    }
  }

  @Get('id/:id')
  async findOne(@Res() res, @Param('id') id: string) {
    try {
      const person = await this.personService.findOne(id);
      return res.status(HttpStatus.OK).json(person);
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json({ message: e.message });
    }
  }

  @Patch('id/:id')
  async update(@Res() res, @Param('id') id: string, @Body() updatePersonDto: UpdatePersonDto) {
    try {
      const person = await this.personService.update(id, updatePersonDto);
      return res.status(HttpStatus.OK).json(person);
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json({ message: e.message });
    }
  }

  @Patch('add-image/:id')
  async addImage(@Res() res, @Param('id') id: string, @Body() body:{image: string}) {
    try {
      const room = await this.personService.addImageToPerson(id,body.image )
      return res.status(HttpStatus.CREATED).json(room);
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json(e);
    }
  }

  @Patch('remove-image/:id')
  async removeImage(@Res() res, @Param('id') id: string, @Body() body:{image: string}) {
    try {
      const room = await this.personService.removeImageFromPerson(id,body.image )
      return res.status(HttpStatus.CREATED).json(room);
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json(e);
    }
  }

  @Patch('add-role/:id')
  async addType(@Res() res, @Param('id') id: string, @Body() body:{type: MoviePersonRole[]}) {
    try {
      const room = await this.personService.addTypeToPerson(id,body.type )
      return res.status(HttpStatus.CREATED).json(room);
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json(e);
    }
  }

  @Patch('remove-type/:id')
  async removeType(@Res() res, @Param('id') id: string, @Body() body:{type: MoviePersonRole[]}) {
    try {
      const room = await this.personService.removeRole(id,body.type )
      return res.status(HttpStatus.CREATED).json(room);
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json(e);
    }
  }

  @Delete('id/:id')
  async remove(@Res() res, @Param('id') id: string) {
    try {
      const result = await this.personService.remove(id);
      return res.status(HttpStatus.OK).json(result);
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json({ message: e.message });
    }
  }
}