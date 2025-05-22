import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { CreateMoviePersonDto } from './dto/create-movie-person.dto';
import { UpdateMoviePersonDto } from './dto/update-movie-person.dto';
import { MoviePersonEntity } from "./entities/movie-person.entity";
import { RoomEntity } from "../room/entities/room.entity";
import { PersonEntity } from "../person/entities/person.entity";

@Injectable()
export class MoviePersonService {

  async create(createDto: CreateMoviePersonDto) {
    try {
      const {room_name, person_name, role} = createDto;

      const room = await RoomEntity.findOneBy({ name: room_name });
      if (!room) throw new BadRequestException('Room not found');

      const person = await PersonEntity.findOneBy({ name: person_name});
      if (!person) throw new BadRequestException('Person not found');

      //todo u can add the same person to the smae movie - but with a diffrent role
      const existing = await MoviePersonEntity.findOne({
        where: {
          room: { id: room.id },
          person: { id: person.id },
          person_role: role,
        },
        relations: ['room', 'person'],
      });

      if (existing) {
        throw new BadRequestException('This person already has this role in this room');
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
        throw new NotFoundException('MoviePerson not found');
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
        throw new NotFoundException('MoviePerson not found');
      }


      const newRoom = updateDto.room_name
        ? await RoomEntity.findOneBy({ name: updateDto.room_name })
        : moviePerson.room;

      if (!newRoom) throw new BadRequestException('Room not found');

      const newPerson = updateDto.person_name
        ? await PersonEntity.findOneBy({ name: updateDto.person_name })
        : moviePerson.person;

      if (!newPerson) throw new BadRequestException('Person not found');

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
          'Another entry already has this person, room and role combination.',
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
        throw new NotFoundException('MoviePerson not found');
      }

      await moviePerson.remove();

      return { message: 'MoviePerson deleted successfully' };
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }
}
