import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { CreateRatingDto } from "./dto/create-rating.dto";
import { RatingEntity } from "./entities/rating.entity";
import { PersonService } from "../person/person.service";
import { RatingType } from "../shared/rating-type";
import { RoomService } from "../room/room.service";
import { RoomEntity } from "../room/entities/room.entity";
import { MoviePersonRole } from "../shared/movie-person-role";

@Injectable()
export class RatingService {

  constructor(
    private roomService: RoomService,
    private personService: PersonService,
  ) {
  }

  async create(userId: string, movieOrPersonId: string, dto: CreateRatingDto) {
    try {
      const rating = new RatingEntity();
      rating.userId = userId;
      rating.rating = parseFloat(dto.rating);
      rating.ratingsCount = rating.ratingsCount + 1;
      rating.type = dto.type;

      if (dto.type.includes(MoviePersonRole.Producer) || dto.type.includes(MoviePersonRole.Actor) || dto.type.includes(MoviePersonRole.Director)) {
        const person = await this.personService.findOne(movieOrPersonId);
        rating.person = person;
      } else {
       const room = await this.roomService.findOne(movieOrPersonId);
       rating.room = room;
      }

      return rating.save();
    } catch (e) {
      throw new BadRequestException(e.message);
    }
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

  async updateMoviePersonRating(moviePersonId: string, userId: string, rating: string) {
    try {

      // const movie = await RoomEntity.findOne({ where: { id: moviePersonId } });
      // const person = await PersonEntity.findOne({ where: { id: moviePersonId } });
      //

      const newRating = Number(rating);
      if (isNaN(newRating) || newRating < 1 || newRating > 10) {
        throw new BadRequestException('Rating must be a number between 0 and 10');
      }


      const existingRating = await this.findOneByRoomPersonId(moviePersonId);

      console.log('existingRating');
      console.log(existingRating);



      if (existingRating) {

        const oldTotal = existingRating.rating * existingRating.ratingsCount;
        const newRatingsCount = existingRating.ratingsCount + 1;
        const newAverageRating = (oldTotal + newRating) / newRatingsCount;

        existingRating.rating = parseFloat(newAverageRating.toFixed(2));
        existingRating.ratingsCount = newRatingsCount;

        await existingRating.save();

        return {
          message: 'Rating updated successfully',
          newRating: existingRating.rating,
          ratingsCount: existingRating.ratingsCount,
        };
      } else {

        // const newRatingEntity = new RatingEntity();

        const newRatingsCount = existingRating.ratingsCount + 1;
        const newAverageRating = newRating / newRatingsCount;

        existingRating.rating = parseFloat(newAverageRating.toFixed(2));
        existingRating.ratingsCount = newRatingsCount;

        await existingRating.save();

        return {
          message: 'Rating updated successfully',
          newRating: existingRating.rating,
          ratingsCount: existingRating.ratingsCount,
        };
      }
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }


}
