import { Module } from '@nestjs/common';
import { PersonService } from './person.service';
import { PersonController } from './person.controller';
import { JwtService } from "@nestjs/jwt";

@Module({
  controllers: [PersonController],
  providers: [PersonService, JwtService],
  exports:[PersonService]
})
export class PersonModule {}
