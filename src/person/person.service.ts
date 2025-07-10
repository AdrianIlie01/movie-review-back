import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';
import { PersonEntity } from "./entities/person.entity";
import { RatingEntity } from "../rating/entities/rating.entity";
import { MoviePersonRole } from "../shared/movie-person-role";
import { RoomEntity } from "../room/entities/room.entity";
import { FilterPerson } from "../shared/filter-person";
import { Not } from "typeorm";

@Injectable()
export class PersonService {
  async create(createPersonDto: CreatePersonDto) {
    try {
      const person = new PersonEntity();

      typeof createPersonDto.description !== 'undefined'
        ? (person.description = createPersonDto.description)
        : person.name =  null;

      typeof createPersonDto.born !== 'undefined'
        ? (person.born = createPersonDto.born)
        : person.born =  null;

      person.name = createPersonDto.name;
      // person.description = createPersonDto.description;
      // person.born = createPersonDto.born;
      person.images = createPersonDto.images;
      person.roles = createPersonDto.roles;

      return await person.save();
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }
  async findAll() {
    try {
      return await PersonEntity.find({ relations: ['movieRoles'] });
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async findOne(id: string) {
    try {
      const person = await PersonEntity.findOne({
        where: { id },
        relations: ['movieRoles'],
      });

      if (!person) {
        throw new NotFoundException('Person not found');
      }

      return person;
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async findImagesPerson(id: string) {
    try {
      const person = await PersonEntity.findOne({
        where: { id },
      });

      if (!person) {
        throw new NotFoundException('Person not found');
      }

      if (!person.images || person.images.length === 0) {
        throw new NotFoundException('No images available for this person');
      }

      return person.images;
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async update(id: string, updateDto: UpdatePersonDto) {
    try {
      const person = await PersonEntity.findOneBy({ id });

      if (!person) {
        throw new NotFoundException('Person not found');
      }

      const personBorn = person.born;

      // use the input from form but if it is undefined than use the data from the database
      person.name = updateDto.name ?? person.name;
      person.description = updateDto.description ?? person.description;

      updateDto.born == null
        ? person.born = null
        : typeof updateDto.born !== 'undefined'
          ? person.born = updateDto.born
          : person.born = personBorn;


      if (updateDto.roles !== undefined) {
        person.roles = updateDto.roles;
      }

      return await person.save();
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async filterPerson(query: FilterPerson) {
      try {
        const qb = PersonEntity.createQueryBuilder('person')
          .leftJoinAndSelect('person.rating', 'rating');

        if (query.roles && query.roles.length > 0) {
          qb.andWhere('FIND_IN_SET(:roles, person.roles) > 0', { roles: query.roles });

        }

        if (query.name) {
          qb.andWhere('LOWER(person.name) LIKE :name', {
            name: `%${query.name.toLowerCase()}%`,
          });
        }

        if (query.born) {
          qb.andWhere('YEAR(person.born) = :bornYear', { bornYear: query.born });
        }


        if (query.ratingMin !== undefined) {
          qb.andWhere('rating.rating >= :ratingMin', {
            ratingMin: query.ratingMin,
          });
        }

        if (query.sortField && query.sortOrder) {
          const allowedSortFields = ['name', 'rating', 'release_year', 'born'];
          if (allowedSortFields.includes(query.sortField)) {
            let sortColumn = query.sortField;
            const sortAlias = query.sortField === 'rating' ? 'rating' : 'person'; // random name for the join

            qb.orderBy(`${sortAlias}.${sortColumn}`, query.sortOrder.toUpperCase() as 'ASC' | 'DESC');
          }
        }

        return await qb.getMany();
      } catch (e) {
        throw new BadRequestException(e.message);
      }
    }

  async addImageToPerson(id: string, newImage: string) {
    try {
      const person = await PersonEntity.findOneBy({ id });
      if (!person) {
        throw new NotFoundException(`Person with id ${id} not found`);
      }

      if (!person.images) {
        person.images = [];
      }

      if (person.images.includes(newImage)) {
        throw new BadRequestException(`Image already exists for this person`);
      }

      person.images.push(newImage);
      await person.save();

      return person;
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async removeImageFromPerson(id: string, imageToRemove: string) {
    try {
      const person = await PersonEntity.findOneBy({ id });
      if (!person) {
        throw new NotFoundException(`Person with id ${id} not found`);
      }

      if (!person.images || person.images.length === 0) {
        return person;
      }

      person.images = person.images.filter(
        img => img.toLowerCase() !== imageToRemove.toLowerCase(),
      );

      await person.save();
      return person;
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async addNewRolesWithoutOldOnes(id: string, newRoles: MoviePersonRole[]) {
    try {
      const person = await PersonEntity.findOneBy({ id });
      if (!person) {
        throw new NotFoundException(`Person with id ${id} not found`);
      }

      if (!person.roles) {
        person.roles = [];
      }

      const rolesToAdd = newRoles.filter(role => !person.roles.includes(role));

      if (rolesToAdd.length !== 0) {

        person.roles.push(...rolesToAdd);

        await person.save();
        // return person;
      }
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async addRoleToPerson(id: string, newRoles: MoviePersonRole[]) {
    try {
      const person = await PersonEntity.findOneBy({ id });
      if (!person) {
        throw new NotFoundException(`Person with id ${id} not found`);
      }

      if (!person.roles) {
        person.roles = [];
      }

      const rolesToAdd = newRoles.filter(role => !person.roles.includes(role));

      if (rolesToAdd.length === 0) {
        throw new BadRequestException(`Roles '${newRoles}' already exist for this person`);
      }

      person.roles.push(...rolesToAdd);

      const ratingEntity = await RatingEntity.findOne({
        where: {
          person: {id: id}
        }
      })

      if (ratingEntity) {
        ratingEntity.type.push(...rolesToAdd);
        await ratingEntity.save();
      }


      await person.save();
      return person;
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async removeRole(id: string, roleToRemove: MoviePersonRole[]) {
    try {
      const person = await PersonEntity.findOneBy({ id });
      if (!person) {
        throw new NotFoundException(`Movie with id ${id} not found`);
      }

      if (!person.roles || person.roles.length === 0) {
        return person;
      }

      // we save person roles without the one from the input
      person.roles = person.roles.filter(
        (t: MoviePersonRole) => !roleToRemove.includes(t)
      );


      const ratingEntity = await RatingEntity.findOne({
        where: {
          room: {id: id}
        }
      })

      if (ratingEntity) {
        ratingEntity.type = ratingEntity.type.filter(
          (t: MoviePersonRole) => !roleToRemove.includes(t)
        );

        await ratingEntity.save();
      }

      await person.save();

      return person;
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async checkNameAvailability(name: string) {
    try{
      const  person = await PersonEntity.findOne({
        where: { name: name },
      });


      if (person) {
        return {
          message: 'name taken',
        }
      } else {
        return {
          message: 'name available',
        }
      }

    } catch (e) {
      throw new BadRequestException(e.message)
    }
  }

  async checkNameEditAvailability(name: string, id: string) {
    try{
      const  person = await PersonEntity.findOne({
        where: { name: name, id: Not(id) },
      });


      if (person) {
        return {
          message: 'name taken',
        }
      } else {
        return {
          message: 'name available',
        }
      }

    } catch (e) {
      throw new BadRequestException(e.message)
    }
  }

  async remove(id: string) {
    try {
      const person = await PersonEntity.findOneBy({ id });

      if (!person) {
        throw new NotFoundException('Person not found');
      }

      // in movie-person we have: onDelete: 'CASCADE' - so we dont need fist here to delete the entry from movie-person
      await person.remove();

      return { message: 'Person deleted successfully' };
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }
}
