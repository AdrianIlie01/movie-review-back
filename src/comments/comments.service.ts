import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { CreateCommentDto } from './dto/create-comment.dto';
import { FirebaseService } from "../firebase/firebase.service";
import * as admin from 'firebase-admin';
import { v4 as uuidv4 } from 'uuid';
import { RoomEntity } from "../room/entities/room.entity";
import { CreateDonationMessageDto } from "./dto/create-donation-message.dto";

@Injectable()
export class CommentsService {
  constructor(private readonly firebaseAdmin: FirebaseService) {}
  async addComment(movieId: string, userId: string, username, dto: CreateCommentDto) {
    try{
      const firestore = this.firebaseAdmin.getFirestore();
      const commentId = uuidv4();

      const movie = await RoomEntity.findOne({where:{
        id: movieId
        }})

      if (!movie) {
        throw new NotFoundException('Movie not found');
      }

      console.log('connected')

      const commentsRef = firestore
        .collection('movies-comments')
        .doc(movieId)
        .collection('comments')
        .doc(commentId);

      await commentsRef.set({
        id: commentId,
        movieId: movieId,
        movieTitle: movie.name,
        userId: userId,
        userName: username,
        text: dto.text,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // await commentsRef.add({
      //   movieId: dto.movieId,
      //   movieTitle: dto.movieTitle,
      //   userId: userId,
      //   userName: dto.userName,
      //   text: dto.text,
      //   createdAt: admin.firestore.FieldValue.serverTimestamp(),
      // });

      return { message: 'Comment added', commentId };
    } catch (e) {
      throw new BadRequestException(e.message)
    }
  }

  // movieId - id of mySql room table and the same in movies-comments on firestore
  async deleteComment(movieId: string, commentId: string) {
    try {
      const firestore = this.firebaseAdmin.getFirestore();

      const commentRef = firestore
        .collection('movies-comments')
        .doc(movieId)
        .collection('comments')
        .doc(commentId);

      const commentSnap = await commentRef.get();

      if (!commentSnap.exists) {
        throw new NotFoundException('Comment not found');
      }

      const commentData = commentSnap.data();

      await firestore.collection('comments-blacklist').doc(commentId).set({
        ...commentData,
        deletedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      await commentRef.delete();

      return { message: 'Comment deleted and added to blacklist' };
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async addDonationMessage(movieId: string, userId: string, username, dto: CreateDonationMessageDto) {
    try{
      const firestore = this.firebaseAdmin.getFirestore();
      const commentId = uuidv4();

      const movie = await RoomEntity.findOne({where:{
          id: movieId
        }})

      if (!movie) {
        throw new NotFoundException('Movie not found');
      }


      const commentsRef = firestore
        .collection('donation-comments')
        .doc(movieId)
        .collection('comments')
        .doc(commentId);

      await commentsRef.set({
        id: commentId,
        movieId: movieId,
        movieTitle: movie.name,
        userId: userId,
        userName: username,
        amount: dto.amount,
        text: dto.text,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return { message: 'Comment added', commentId };
    } catch (e) {
      throw new BadRequestException(e.message)
    }
  }

}
