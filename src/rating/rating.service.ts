import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { CreateRatingDto } from "./dto/create-rating.dto";
import { RatingEntity } from "./entities/rating.entity";
import { PersonService } from "../person/person.service";
import { RatingType } from "../shared/rating-type";
import { RoomService } from "../room/room.service";
import { RoomEntity } from "../room/entities/room.entity";
import { MoviePersonRole } from "../shared/movie-person-role";
import { PersonEntity } from "../person/entities/person.entity";

@Injectable()
export class RatingService {

  constructor(
    private roomService: RoomService,
    private personService: PersonService,
  ) {
  }
  async findOne(id: string) {
    try {
      return await RatingEntity.findOneBy({
        id: id,
      });
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async findOneByRoomPersonId(id: string) {
    try {
      return await RatingEntity.findOne({where: [
          { room: {id: id} },
          { person: {id: id} },
        ]
      });
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async addOrUpdateRating(moviePersonId: string, userId: string, dto : CreateRatingDto) {
    const {rating} = dto;
    const ratingNumber = parseInt(rating)
    const movie = await RoomEntity.findOne({ where: { id: moviePersonId } });
    const person = await PersonEntity.findOne({ where: { id: moviePersonId } });

    if (!movie && !person) {
      throw new NotFoundException('Movie or Person not found');
    }

    if (ratingNumber < 1 || ratingNumber > 10) {
      throw new BadRequestException('Rating must be between 1 and 10');
    }

    let existingRating = await RatingEntity.findOne({
      where: {
        userId,
        ...(movie ? { room: { id: moviePersonId } } : {}),
        ...(person ? { person: { id: moviePersonId } } : {}),
      },
    });

    if (existingRating) {
        if (movie)  existingRating.type = movie.type;
        if (person) existingRating.type = person.roles;

      existingRating.rating = ratingNumber;
      await existingRating.save();
    } else {


      const newRating = new RatingEntity();

      newRating.userId = userId;
      newRating.rating = ratingNumber;
      if (movie) {
        newRating.type = movie.type;
        newRating.room = movie;
      } else if (person) {
        newRating.type = person.roles;
        newRating.person = person;
      }
      await newRating.save();
    }

    return this.calculateAverageRating(moviePersonId);
  }


  async calculateAverageRating(moviePersonId: string) {
    const movie = await RoomEntity.findOne({ where: { id: moviePersonId } });
    const person = await PersonEntity.findOne({ where: { id: moviePersonId } });

    const ratings = await RatingEntity.find({
      where: {
        ...(movie ? { room: { id: moviePersonId } } : {}),
        ...(person ? { person: { id: moviePersonId } } : {}),
      },
    });

    if (!ratings.length) {
      return { averageRating: 0, ratingsCount: 0 };
    }

    const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
    const averageRating = sum / ratings.length;

    return {
      averageRating: parseFloat(averageRating.toFixed(2)),
      ratingsCount: ratings.length,
    };
  }

}
