import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { UserEntity } from "../user/entities/user.entity";
import { RoomEntity } from "./entities/room.entity";
import { getRepository, Like, MoreThanOrEqual, Not, Raw, Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { RatingService } from "../rating/rating.service";
import { PersonEntity } from "../person/entities/person.entity";
import { MovieType } from "../shared/movie-type";
import { RatingEntity } from "../rating/entities/rating.entity";
import { FilterMovies } from "../shared/filter-movies";

@Injectable()
export class RoomService {
  constructor(
    @InjectRepository(RoomEntity)
    private readonly roomRepository: Repository<RoomEntity>,
  ) {
  }
  async create(createRoomDto: CreateRoomDto) {
    try{
      const {name, stream_url, thumbnail, type, release_year} = createRoomDto;
      const room = new RoomEntity();
      room.name = name;
      room.stream_url = stream_url;
      room.release_year = release_year

      room.type = type;

      // if (file) {
      //   room.thumbnail = file.filename;
      // }

      // todo - we will not use an image
      //  because the server where i host my app doesnt allow on my free plan to store files on it
        room.thumbnail = 'thumbnail';

      const savedRoom = await room.save();
      console.log(savedRoom);

      return savedRoom;
    } catch (e) {
      throw new BadRequestException(e.message)
    }
  }

  async checkNameAvailability(name: string) {
    try{
      const  room = await RoomEntity.findOne({
        where: { name: name },
      });


      if (room) {
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

  async findAll() {
    try {
      return await RoomEntity.find();
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  //filter movie by:
  // movie type: string
  // name - if it contains that string
  // order by rating ASC or DESC
  async filterMovies(query: FilterMovies) {
    try {
      const qb = RoomEntity.createQueryBuilder('room')
        .leftJoinAndSelect('room.rating', 'rating');

      if (query.type) {
        // qb.andWhere('room.type = :type', { type: query.type });
        qb.andWhere('FIND_IN_SET(:type, room.type) > 0', { type: query.type });
      }

      if (query.name) {
        qb.andWhere('LOWER(room.name) LIKE :name', {
          name: `%${query.name.toLowerCase()}%`,
        });
      }

      if (query.ratingMin !== undefined) {
        qb.andWhere('rating.rating >= :ratingMin', {
          ratingMin: query.ratingMin,
        });
      }

      if (query.releaseYear) {
        qb.andWhere('room.release_year = :releaseYear', { releaseYear: query.releaseYear });
      }

      if (query.sortField && query.sortOrder) {
        const allowedSortFields = ['name', 'type', 'rating', 'release_year'];
        if (allowedSortFields.includes(query.sortField)) {
          const sortAlias = query.sortField === 'rating' ? 'rating' : 'room'; // random name for the join
          qb.orderBy(`${sortAlias}.${query.sortField}`, query.sortOrder.toUpperCase() as 'ASC' | 'DESC');
        }
      }

      return await qb.getMany();
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }


  async findOne(id: string) {
    try {
     return await RoomEntity.findOneBy({
        id: id,
      });
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async findByName(name: string) {
    try {
      const room = await RoomEntity.findOne({
        where: {
          name: name,
        },
      });
      console.log(room);
      return room;
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async findByType(type: string) {
    try {
      const room = await RoomEntity.find({
        where: {
          // type: type,
          type: Raw(alias => `${alias} LIKE :type`, { type: `%${type}%` }),
        },
      });
      console.log(room);
      return room;
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async update(
    id: string,
    updateRoomDto: UpdateRoomDto,
    // file: Express.Multer.File,
  ) {
    try {
      const { name, stream_url, thumbnail, release_year, type } = updateRoomDto;
      const room = await RoomEntity.findOneBy({
        id: id,
      });

      if (!room) {
        throw new BadRequestException('Room not found');
      }

      const roomName = room.name;
      const roomStreamUrl = room.stream_url;
      const roomThumbnail = room.thumbnail;
      const releaseYear = room.release_year;
      const roomType: MovieType[] = room.type;

      typeof name !== 'undefined'
        ? (room.name = name)
        : (room.name = roomName);

      typeof stream_url !== 'undefined'
        ? (room.stream_url = stream_url)
        : (room.stream_url = roomStreamUrl);

      typeof release_year !== 'undefined'
        ? (room.release_year = release_year)
        : (room.release_year = releaseYear);

      typeof type !== 'undefined'
        ? (room.type = type)
        : (room.type = roomType);

      if (typeof type === undefined && !room.type ) {
        throw new BadRequestException('Select at least a type for this movie!');
      }

      typeof thumbnail !== 'undefined'
        ? room.thumbnail = thumbnail
        : room.thumbnail = roomThumbnail;

      return await room.save();
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async checkNameEditAvailability(name: string, id: string) {
    try{
      const  room = await RoomEntity.findOne({
        where: { name: name, id: Not(id) },
      });


      if (room) {
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

  async addTypeToMovie(id: string, newType: MovieType[]) {
    try {
      const movie = await RoomEntity.findOneBy({ id });
      if (!movie) {
        throw new NotFoundException(`Movie with id ${id} not found`);
      }

      if (!movie.type) {
        movie.type = [];
      }

      const typesToAdd = newType.filter(t=> !movie.type.includes(t));

      if (typesToAdd.length === 0) {
        throw new BadRequestException(`Types '${newType}' already exist for this movie`);
      }


      movie.type.push(...typesToAdd);

      //find the coresponding rating and update its type

      const ratingEntity = await RatingEntity.findOne({
        where: {
          room: {id: id}
        }
      })

      if (ratingEntity) {
        ratingEntity.type.push(...typesToAdd);
        await ratingEntity.save();
      }


      await movie.save();
      return movie;
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async removeTypeFromMovie(id: string, typeToRemove: MovieType[]) {
    try {
      const movie = await RoomEntity.findOneBy({ id });
      if (!movie) {
        throw new NotFoundException(`Movie with id ${id} not found`);
      }

      if (!movie.type || movie.type.length === 0) {
        return movie;
      }

      // salvam movie type ca array-ul type fara type din input
      movie.type = movie.type.filter((t: MovieType) => !typeToRemove.includes(t));


      const ratingEntity = await RatingEntity.findOne({
        where: {
          room: {id: id}
        }
      })

      if (ratingEntity) {
        ratingEntity.type = ratingEntity.type.filter(
          (t: MovieType) => !typeToRemove.includes(t)
        );

        await ratingEntity.save();
      }


      await movie.save();

      return movie;
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }


  async remove(id: string) {
    try {

      const room = await RoomEntity.findOneBy({
        id: id,
      });

      if (!room) {
        throw new BadRequestException('Room not found');
      }
      await room.remove();

      return {message: 'Room deleted successfully'};
      } catch (e) {
        throw new BadRequestException(e.message);
      }
  }
}
