import { Module } from '@nestjs/common';
import { RoomService } from './room.service';
import { RoomController } from './room.controller';
import { TypeOrmModule } from "@nestjs/typeorm";
import { RoomEntity } from "./entities/room.entity";
import { PersonService } from "../person/person.service";

@Module({
  imports: [TypeOrmModule.forFeature([RoomEntity])],
  controllers: [RoomController],
  providers: [RoomService, PersonService],
  exports:[RoomService]
})
export class RoomModule {}
