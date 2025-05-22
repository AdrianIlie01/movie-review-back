import { Controller, Get, Post, Body, Patch, Param, Delete, Res, HttpStatus, Req, UseGuards } from "@nestjs/common";
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { LoginGuard } from "../auth/guards/login.guards";
import { CreateDonationMessageDto } from "./dto/create-donation-message.dto";

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  //todo protect it with auth guard
  // - si atunci o sa aibe req.user.id
  @UseGuards(LoginGuard)
  @Post('add/:movieId')
  async addComment(@Res() res, @Req() req, @Param('movieId') movieId: string, @Body() dto: CreateCommentDto) {
    try {
      console.log('c1');

      const username = req.user.decodedAccessToken.username;
      const userId = req.user.decodedAccessToken.id;
      console.log('userId2');
      console.log(req.user);

      await this.commentsService.addComment(movieId, userId, username ,dto);
      return res.status(HttpStatus.OK).json({ message: 'Comment added' });
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json(e);
    }
  }

  @UseGuards(LoginGuard)
  @Post('add-donation-message/:movieId')
  async addDonationMessage(@Res() res, @Req() req, @Param('movieId') movieId: string, @Body() dto: CreateDonationMessageDto) {
    try {
      const username = req.user.decodedAccessToken.username;
      const userId = req.user.decodedAccessToken.id;

      await this.commentsService.addDonationMessage(movieId, userId, username ,dto);
      return res.status(HttpStatus.OK).json({ message: 'Comment added' });
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json(e);
    }
  }


  //todo guard protect
  @Post('delete/:movieId/:commentId')
  async deleteComment(@Res() res,
                      @Req() req,
                      @Param('movieId') movieId: string,
                      @Param('commentId') commentId: string) {
    try {
      console.log('pre1');
      await this.commentsService.deleteComment(movieId, commentId);

      return res.status(HttpStatus.OK).json({ message: 'Comment deleted' });
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json(e);
    }
  }
}
