import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { FirebaseService } from "../firebase/firebase.service";

@Module({
  controllers: [CommentsController],
  providers: [CommentsService, FirebaseService],
})
export class CommentsModule {}
