import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserInfoService } from "../user-info/user-info.service";
import { MailService } from "../mail/mail.service";
import { StripeService } from "../stripe/stripe.service";

@Module({
  // imports: [TypeOrmModule.forFeature([UserEntity, UserInfoEntity]),],
  controllers: [UserController],
  providers: [UserService, UserInfoService, MailService, StripeService],
})
export class UserModule {}
