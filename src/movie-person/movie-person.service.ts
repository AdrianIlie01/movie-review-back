import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { CreateMoviePersonDto } from './dto/create-movie-person.dto';
import { UpdateMoviePersonDto } from './dto/update-movie-person.dto';
import { MoviePersonEntity } from "./entities/movie-person.entity";
import { RoomEntity } from "../room/entities/room.entity";
import { PersonEntity } from "../person/entities/person.entity";
import { AddRolesPersonForMovieDto } from "./dto/add-roles-person-for-movie.dto";
import { AddPersonsSingleRoleToMovieDto } from "./dto/add-persons-single-role-to-movie.dto";
import { MoviePersonRole } from "../shared/movie-person-role";
import { RoomService } from "../room/room.service";
import { AddMultipleRolesPerMovieDto } from "./dto/add-multiple-roles-per-movie.dto";
import { PersonService } from "../person/person.service";

@Injectable()
export class MoviePersonService {

  constructor(
    protected personService: PersonService
  ) {
  }

  async create(createDto: CreateMoviePersonDto) {
    try {
      const {room_name, person_name, role} = createDto;

      const room = await RoomEntity.findOneBy({ name: room_name });
      if (!room) throw new BadRequestException('Movie not found');

      const person = await PersonEntity.findOneBy({ name: person_name});
      if (!person) throw new BadRequestException('Person not found');

      const existing = await MoviePersonEntity.findOne({
        where: {
          room: { id: room.id },
          person: { id: person.id },
          person_role: role,
        },
        relations: ['room', 'person'],
      });

      if (existing) {
        throw new BadRequestException('The selected person already holds this role in the specified movie.');
      }

      const moviePerson = new MoviePersonEntity();
      moviePerson.room = room;
      moviePerson.person = person;
      moviePerson.person_role = role;

      return await moviePerson.save();
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async addPersonsToRoleInMovie(movieId: string, createDto: AddPersonsSingleRoleToMovieDto) {
    try {
      const {role, persons} = createDto;

      if (!role) {
        throw new BadRequestException('Role is required.');
      }

      if (!persons || persons.length === 0) {
        throw new BadRequestException('Please select at least one person to add.');
      }

      const room = await RoomEntity.findOneBy({ id: movieId });
      if (!room) throw new BadRequestException('Movie not found');

      // const person = await PersonEntity.findOneBy({ name: person_name});
      // if (!person) throw new BadRequestException('Person not found');

      let personAdded = [];

      for (let personName of persons) {
        const person = await PersonEntity.findOneBy({ name: personName});
        // if (!person) throw new BadRequestException('Person not found')

        if (!person) {
          continue
        }

        await this.personService.addNewRolesWithoutOldOnes(person.id, [role]);


        const existing = await MoviePersonEntity.findOne({
          where: {
            room: { id: movieId },
            person: { id: person.id },
            person_role: role,
          },
          relations: ['room', 'person'],
        });

        if (existing) {
          continue
        }

        const moviePerson = new MoviePersonEntity();
        moviePerson.room = room;
        moviePerson.person = person;
        moviePerson.person_role = role;

         await moviePerson.save();

         personAdded.push(person.name)
      }

      return personAdded;
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async addPersonRolesToMovie(personId: string, createDto: AddMultipleRolesPerMovieDto) {
    try {

      const {roles, movie} = createDto;

      if (!roles || roles.length === 0) {
        throw new BadRequestException('Please select one or more roles.');
      }

      if (!movie) {
        throw new BadRequestException('Please select a movie to add.');
      }

      const room = await RoomEntity.findOneBy({ name: movie });
      if (!room) throw new BadRequestException('Movie not found');

      const person = await PersonEntity.findOneBy({ id: personId});
      if (!person) throw new BadRequestException('Person not found');

      let rolesAddedToMovie = {
        movie: room.name,
        role: ''
      };

      for (let role of roles) {
        const existing = await MoviePersonEntity.findOne({
          where: {
            room: { name: movie },
            person: { id: personId },
            person_role: role,
          },
          relations: ['room', 'person'],
        });

        if (existing) {
          continue
        }

        const moviePerson = new MoviePersonEntity();
        moviePerson.room = room;
        moviePerson.person = person;
        moviePerson.person_role = role;

        await this.personService.addNewRolesWithoutOldOnes(person.id, roles);

        await moviePerson.save();

        rolesAddedToMovie.role = rolesAddedToMovie.role + role + ', ';
      }

      return rolesAddedToMovie;
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }


  // add or remove persons with a single role to a movie
  async managePersonPerRolePerMovie(roomId, role: MoviePersonRole, dto: AddPersonsSingleRoleToMovieDto) {
    try {
      const { persons } = dto;

      const allMoviePersons = await MoviePersonEntity.find({
        where: {
          room: { id: roomId },
          person_role: role
        },
        relations: ['room', 'person'],
      });

      const existingPersonNameSet = new Set(allMoviePersons.map((p:MoviePersonEntity) => p.person.name));
      const incomingPersonSet = new Set(persons);

      // delete persons
      const personToRemove = allMoviePersons.filter(p => !incomingPersonSet.has(p.person.name));

      for (const entity of personToRemove) {
        await entity.remove();
      }

      //insted of throwing error on empty person list - delete all persons with this role
      if (!persons || persons.length === 0) {
        return {removed: personToRemove.map(r => r.person.name) };
        // throw new BadRequestException('No cast provided to add or remove.');
      }

      const movie = await RoomEntity.findOne({ where: { id: roomId } });
      if(!movie) {
        throw new BadRequestException(`Movie not found.`);
      }

      const personAdded = [];

      for (const personName  of persons ) {

        const person = await PersonEntity.findOne({ where: { name: personName  } });
        if(!person) {
          throw new BadRequestException(`Person not found.`);
        }

        //add
        const exists = await MoviePersonEntity.findOne({
          where: {
            room: { id: roomId },
            person: { name: personName  },
            person_role: role
          },
          relations: ['room', 'person'],
        });

        if (exists) {
          // person with this role already  exists
          continue
        }

        await this.personService.addNewRolesWithoutOldOnes(person.id, [role]);


        const newCast = new MoviePersonEntity()
        newCast.room = movie;
        newCast.person = person;
        newCast.person_role = role;
        await newCast.save();

        personAdded.push(newCast.person.name);

      }

      return { added: personAdded, removed: personToRemove.map(r => r.person.name) };
    }
    catch (e) {
      throw new BadRequestException(e.message);
    }
  }
  async managePersonMoviesPerRole(personId, role:MoviePersonRole, dto: AddRolesPersonForMovieDto) {
    try {
      const { movies } = dto;

      const person = await PersonEntity.findOneBy({ id: personId});
      if (!person) throw new BadRequestException('Person not found');

      const existingMovies = await MoviePersonEntity.find({
        where: {
          person: { id: personId },
          person_role: role,
        },
        relations: ['room', 'person'],
      });

      const existingMovieSet =
        new Set(existingMovies.map((m) => {
          return m.room.name;
        }));

      const incomingMovieSet = new Set(movies);

      // add movies
      const moviesToAdd = movies.filter(m => !existingMovieSet.has(m));

      // delete movies
      const moviesToRemove = existingMovies.filter(m => !incomingMovieSet.has(m.room.name));

      for (const entityToDelete of moviesToRemove) {
        await entityToDelete.remove();
      }

      //if movies is empty, delete all movies with this role for the person
      if (!movies || movies.length === 0) {
        return {removed: moviesToRemove.map(r => r.room.name) };
        // throw new BadRequestException('No cast provided to add or remove.');
      }

      // add movies
      for (const movie of moviesToAdd) {
        const roomEntity = await RoomEntity.findOne({ where: { name: movie } });

        if (!roomEntity) {
          throw new BadRequestException(`Movie with name '${movie}' not found.`);
        }

        const cast = new MoviePersonEntity();
        cast.room = roomEntity;
        cast.person = person;
        cast.person_role = role;
        await cast.save();
      }

      await this.personService.addNewRolesWithoutOldOnes(person.id, [role]);



      return { added: moviesToAdd, removed: moviesToRemove.map(r => r.person_role) };
    }
    catch (e) {
      throw new BadRequestException(e.message);
    }
  }
  // add or remove roles for a person in a movie
  async managePersonRolesPerMovie(roomId, personId, dto: AddRolesPersonForMovieDto) {
    try {
        const { roles } = dto;

        // array with all roles that the person has in the movie
        const existingRoles = await MoviePersonEntity.find({
          where: {
            room: { id: roomId },
            person: { id: personId },
          },
          relations: ['room', 'person'],
        });

        const existingRoleSet = new Set(existingRoles.map((r) => r.person_role));
        const incomingRoleSet = new Set(roles);

        // add roles
        const rolesToAdd = roles.filter(r => !existingRoleSet.has(r));

        // delete roles
        const rolesToRemove = existingRoles.filter(r => !incomingRoleSet.has(r.person_role));

        for (const role of rolesToAdd) {
          const entity = new MoviePersonEntity();
          entity.room = existingRoles[0].room;
          entity.person = existingRoles[0].person;
          entity.person_role = role;
          await entity.save();
        }

        for (const entity of rolesToRemove) {
          await entity.remove();
        }

        return { added: rolesToAdd, removed: rolesToRemove.map(r => r.person_role) };
      }
      catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async findAll() {
    try {
      return await MoviePersonEntity.find({ relations: ['room', 'person'] });
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async findOne(id: string) {
    try {
      const moviePerson = await MoviePersonEntity.findOne({
        where: { id },
        relations: ['room', 'person'],
      });

      if (!moviePerson) {
        throw new NotFoundException('Cast not found');
      }

      return moviePerson;
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async findMoviesByPersonRole(personId: string, role: MoviePersonRole) {
    try {
      const moviePerson = await MoviePersonEntity.find({
        where: {
          person : {id: personId},
          person_role: role,
        },
        relations: ['room', 'person'],
      });

      if (!moviePerson) {
        throw new NotFoundException('Cast not found');
      }

      return moviePerson;
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async findCastByMovie(movieId: string) {
    try {
      const moviePerson = await MoviePersonEntity.find({
        where: { room : {id: movieId} },
        relations: ['room', 'person'],
      });

      if (!moviePerson) {
        throw new NotFoundException('Cast not found');
      }

      return moviePerson;
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async findCastByMovieAndRole(movieId: string, role: MoviePersonRole) {
    try {
      const moviePerson = await MoviePersonEntity.find({
        where: {
          room : {id: movieId},
          person_role: role
        },
        relations: ['person'],
      });

      if (!moviePerson) {
        throw new NotFoundException('Cast not found');
      }

      return moviePerson;
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async findMoviesByPerson(personId: string) {
    try {
      const moviePerson = await MoviePersonEntity.find({
        where: { person : {id: personId} },
        relations: ['room', 'person'],
      });

      if (!moviePerson) {
        throw new NotFoundException('Cast not found');
      }

      return moviePerson;
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }


  async update(id: string, updateDto: UpdateMoviePersonDto) {
    try {
      const moviePerson = await MoviePersonEntity.findOne({ where: { id } });

      if (!moviePerson) {
        throw new NotFoundException('Role assignment not found.');
      }


      const newRoom = updateDto.room_name
        ? await RoomEntity.findOneBy({ name: updateDto.room_name })
        : moviePerson.room;

      if (!newRoom) throw new BadRequestException('Movie not found.');

      const newPerson = updateDto.person_name
        ? await PersonEntity.findOneBy({ name: updateDto.person_name })
        : moviePerson.person;

      if (!newPerson) throw new BadRequestException('Person not found.');

      const newRole = updateDto.role ?? moviePerson.person_role;

      // Check for duplicates
      const existing = await MoviePersonEntity.findOne({
        where: {
          room: { id: newRoom.id },
          person: { id: newPerson.id },
          person_role: newRole,
        },
        relations: ['room', 'person'],
      });

      if (existing && existing.id !== moviePerson.id) {
        throw new BadRequestException(
          'This person already has the specified role in this movie.'

      );
      }

      // Atribuire valori actualizate
      moviePerson.room = newRoom;
      moviePerson.person = newPerson;
      moviePerson.person_role = newRole;

      return await moviePerson.save();
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }


  async remove(id: string) {
    try {
      const moviePerson = await MoviePersonEntity.findOneBy({ id });

      if (!moviePerson) {
        throw new NotFoundException('Role assignment not found.');
      }

      await moviePerson.remove();

      return { message: 'Role assignment deleted successfully' };
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }
}
