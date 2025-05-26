import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { FirebaseService } from "../firebase/firebase.service";
import { JwtService } from "@nestjs/jwt";
import { UserService } from "../user/user.service";
import { UserInfoService } from "../user-info/user-info.service";
import { MailService } from "../mail/mail.service";
import { StripeService } from "../stripe/stripe.service";

@Module({
  controllers: [CommentsController],
  providers: [CommentsService, FirebaseService, JwtService, UserService, UserInfoService, MailService, StripeService],
})
export class CommentsModule {}
