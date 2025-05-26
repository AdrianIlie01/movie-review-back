import { Module } from '@nestjs/common';
import { FirebaseService } from './firebase.service';
import { FirebaseController } from './firebase.controller';
import { UserService } from "../user/user.service";
import { StripeService } from "../stripe/stripe.service";
import { MailService } from "../mail/mail.service";
import { UserInfoService } from "../user-info/user-info.service";
import { JwtService } from "@nestjs/jwt";

@Module({
  controllers: [FirebaseController],
  providers: [FirebaseService, UserService, StripeService, MailService, UserInfoService, JwtService],
})
export class FirebaseModule {}
