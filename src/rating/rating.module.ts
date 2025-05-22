import { forwardRef, Module } from "@nestjs/common";
import { RatingService } from './rating.service';
import { RatingController } from './rating.controller';
import { PersonService } from "../person/person.service";
import { RoomService } from "../room/room.service";
import { RoomEntity } from "../room/entities/room.entity";
import { TypeOrmModule } from "@nestjs/typeorm";

@Module({
  imports: [TypeOrmModule.forFeature([RoomEntity]),],
  controllers: [RatingController],
  providers: [RatingService, PersonService, RoomService],
})
export class RatingModule {}
