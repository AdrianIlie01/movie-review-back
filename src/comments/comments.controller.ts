import { Controller, Get, Post, Body, Patch, Param, Delete, Res, HttpStatus, Req } from "@nestjs/common";
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  //todo protect it with auth guard
  @Post('add')
  async addComment(@Res() res, @Req() req,
         @Body() dto: CreateCommentDto) {
    try {
      console.log('c1');

      // const userId = req.user.id;
      const userId = '1';
      console.log('c1');
      await this.commentsService.addComment(userId, dto);
      console.log('c1');

      return res.status(HttpStatus.OK).json({ message: 'Comentariu adăugat cu succes' });
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json(e);
    }
  }

  @Get()
  async getSome(@Res() res, @Req() req, @Body() dto: CreateCommentDto) {
    try {
      return res.status(HttpStatus.OK).json({ message: 'Comentariu get' });
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json(e);
    }
  }


}
