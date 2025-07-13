import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { CreateCommentDto } from './dto/create-comment.dto';
import { FirebaseService } from "../firebase/firebase.service";
import * as admin from 'firebase-admin';
import { v4 as uuidv4 } from 'uuid';
import { RoomEntity } from "../room/entities/room.entity";
import { CreateDonationMessageDto } from "./dto/create-donation-message.dto";
import { UserEntity } from "../user/entities/user.entity";

@Injectable()
export class CommentsService {
  constructor(private readonly firebaseAdmin: FirebaseService) {}
  async addComment(movieId: string, userId: string, username: string, dto: CreateCommentDto) {
    try {
      const firestore = this.firebaseAdmin.getFirestore();
      const commentId = uuidv4();

      const movie = await RoomEntity.findOne({
        where: { id: movieId }
      });

      const user = await UserEntity.findOneBy({username: username})

      if (!movie) {
        throw new NotFoundException('Movie not found');
      }

      const commentData = {
        id: commentId,
        movieId,
        movieTitle: movie.name,
        userId,
        userName: username,
        status: user?.status,
        role: user?.role,
        text: dto.text,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      };

      const commentRef = firestore
        .collection('movies-comments')
        .doc(movieId)
        .collection('comments')
        .doc(commentId);

      await commentRef.set(commentData);

      return { message: 'Comment added', id: commentId };
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }
  // movieId - id of mySql room table and the same in movies-comments on firestore
  async updateUserCommentsStatusInMovie(
    movieId: string,
    userId: string,
    newStatus: {status: string} // ex: 'banned' sau 'inactive'
  ) {
    try {
      const firestore = this.firebaseAdmin.getFirestore();

      const commentsCollectionRef = firestore
        .collection('movies-comments')
        .doc(movieId)
        .collection('comments');

      // Query: toate comentariile userului în acel movieId
      const querySnapshot = await commentsCollectionRef.where('userId', '==', userId).get();

      if (querySnapshot.empty) {
        return { message: 'No comments found for this user in this movie' };
      }

      const batch = firestore.batch();

      querySnapshot.forEach(doc => {
        batch.update(doc.ref, { status: newStatus.status });
      });

      await batch.commit();

      return { message: `Updated ${querySnapshot.size} comments status to ${newStatus.status}` };
    } catch (error: any) {
      throw new BadRequestException(error.message);
    }
  }



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

      return { message: 'Comment added', id: commentId };
    } catch (e) {
      throw new BadRequestException(e.message)
    }
  }

}
