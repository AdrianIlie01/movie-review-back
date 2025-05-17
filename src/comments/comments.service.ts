import { BadRequestException, Injectable } from "@nestjs/common";
import { CreateCommentDto } from './dto/create-comment.dto';
import { FirebaseService } from "../firebase/firebase.service";
import * as admin from 'firebase-admin';

@Injectable()
export class CommentsService {
  constructor(private readonly firebaseAdmin: FirebaseService) {}
  async addComment(userId: string, dto: CreateCommentDto) {
    try{
      const firestore = this.firebaseAdmin.getFirestore();

      console.log('connected')

      const commentsRef = firestore
        .collection('movies')
        .doc(dto.movieId)
        .collection('comments');

      await commentsRef.add({
        movieId: dto.movieId,
        movieTitle: dto.movieTitle,
        userId: userId,
        userName: dto.userName,
        text: dto.text,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return { message: 'Comentariu adăugat cu succes' };
    } catch (e) {
      throw new BadRequestException(e.message)
    }
  }

}
