import { Module } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { StripeController } from './stripe.controller';
import { UserService } from "../user/user.service";
import { UserInfoService } from "../user-info/user-info.service";
import { JwtService } from "@nestjs/jwt";
import { MailService } from "../mail/mail.service";

@Module({
  controllers: [StripeController],
  providers: [StripeService, UserService, UserInfoService, JwtService, MailService],
})
export class StripeModule {}
