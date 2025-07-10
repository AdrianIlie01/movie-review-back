import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus, Res, Query, UseGuards } from "@nestjs/common";
import { PersonService } from './person.service';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';
import { MoviePersonRole } from "../shared/movie-person-role";
import { LoginGuard } from "../auth/guards/login.guards";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { FilterPerson } from "../shared/filter-person";

@Controller('person')
export class PersonController {
  constructor(private readonly personService: PersonService) {}

  @UseGuards(LoginGuard)
  @UseGuards(RolesGuard)
  @Roles('admin', 'moderator')
  @Post()
  async create(@Res() res, @Body() createPersonDto: CreatePersonDto) {
    try {
      const person = await this.personService.create(createPersonDto);
      return res.status(HttpStatus.CREATED).json(person);
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json({ message: e.message });
    }
  }

  @UseGuards(LoginGuard)
  @Get('filter')
  async filter(@Res() res, @Query() query: FilterPerson) {
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

  @UseGuards(LoginGuard)
  @Get('id/:id')
  async findOne(@Res() res, @Param('id') id: string) {
    try {
      const person = await this.personService.findOne(id);
      return res.status(HttpStatus.OK).json(person);
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json({ message: e.message });
    }
  }

  @UseGuards(LoginGuard)
  @UseGuards(RolesGuard)
  @Roles('admin', 'moderator')
  @Patch('id/:id')
  async update(@Res() res, @Param('id') id: string, @Body() updatePersonDto: UpdatePersonDto) {
    try {
      const person = await this.personService.update(id, updatePersonDto);
      return res.status(HttpStatus.OK).json(person);
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json({ message: e.message });
    }
  }

  @UseGuards(LoginGuard)
  @UseGuards(RolesGuard)
  @Roles('admin', 'moderator')
  @Patch('add-image/:id')
  async addImage(@Res() res, @Param('id') id: string, @Body() body:{image: string}) {
    try {
      const room = await this.personService.addImageToPerson(id,body.image )
      return res.status(HttpStatus.CREATED).json(room);
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json(e);
    }
  }

  @UseGuards(LoginGuard)
  @UseGuards(RolesGuard)
  @Roles('admin', 'moderator')
  @Patch('remove-image/:id')
  async removeImage(@Res() res, @Param('id') id: string, @Body() body:{image: string}) {
    try {
      const room = await this.personService.removeImageFromPerson(id,body.image )
      return res.status(HttpStatus.CREATED).json(room);
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json(e);
    }
  }

  @UseGuards(LoginGuard)
  @UseGuards(RolesGuard)
  @Roles('admin', 'moderator')
  @Patch('add-role/:id')
  async addRole(@Res() res, @Param('id') id: string, @Body() body:{role: MoviePersonRole[]}) {
    try {
      const room = await this.personService.addRoleToPerson(id,body.role )
      return res.status(HttpStatus.CREATED).json(room);
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json(e);
    }
  }

  @UseGuards(LoginGuard)
  @UseGuards(RolesGuard)
  @Roles('admin', 'moderator')
  @Patch('remove-role/:id')
  async removeRole(@Res() res, @Param('id') id: string, @Body() body:{role: MoviePersonRole[]}) {
    try {
      const room = await this.personService.removeRole(id,body.role )
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
      const result = await this.personService.remove(id);
      return res.status(HttpStatus.OK).json(result);
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json({ message: e.message });
    }
  }

  @Get('check-name-availability/:name')
  async  checkName(
    @Res() res,
    @Param('name') name: string
  ) {
    try {
      const check = await this.personService.checkNameAvailability(name);
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
      const check = await this.personService.checkNameEditAvailability(name, id);
      return res.status(HttpStatus.OK).json(check);
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json(e);
    }
  }

  @Get('default-person-image/:name')
  async getDefaultImage(@Res() res, @Param('name') name: string)  {
    try {
      res.sendFile(name, { root: 'uploaded-images' });
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json(e);
    }
  }

  @Get('images-name/:id')
  async getImagesName(@Res() res, @Param('id') id: string) {
    try {
      const person = await this.personService.findImagesPerson(id);
      // res.sendFile(name, { root: 'uploaded-images' });
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json(e);
    }
  }

  @Get('images/file/:filename')
  getImageFile(@Param('filename') filename: string, @Res() res) {
    try {
      return res.sendFile(filename, { root: 'uploaded-images' });
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json(e);
    }
  }

}