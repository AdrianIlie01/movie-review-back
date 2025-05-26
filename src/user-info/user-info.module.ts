import { Module } from '@nestjs/common';
import { UserInfoService } from './user-info.service';
import { UserInfoController } from './user-info.controller';
import { JwtService } from "@nestjs/jwt";

@Module({
  controllers: [UserInfoController],
  providers: [UserInfoService, JwtService],
})
export class UserInfoModule {}
