import { Controller, Get, Post, Body, Patch, Param, Delete, Res, HttpStatus, Req, UseGuards } from "@nestjs/common";
import { RatingService } from './rating.service';
import { CreateRatingDto } from './dto/create-rating.dto';
import { UpdateRatingDto } from './dto/update-rating.dto';
import { CreatePersonDto } from "../person/dto/create-person.dto";
import { LoginGuard } from "../auth/guards/login.guards";

@Controller('rating')
export class RatingController {
  constructor(private readonly ratingService: RatingService) {}

  // @UseGuards(LoginGuard)
  // @Post('id/:id')
  // async create(@Res() res, @Req() req, @Param('id') moviePersonId: string, @Body() createPersonDto: CreateRatingDto) {
  //   try {
  //     const userId = req.user.decodedAccessToken.id
  //
  //     const person = await this.ratingService.create(userId, moviePersonId, createPersonDto);
  //     return res.status(HttpStatus.CREATED).json(person);
  //   } catch (e) {
  //     return res.status(HttpStatus.BAD_REQUEST).json({ message: e.message });
  //   }
  // }

  @Get('id/:id')
  async findOne(@Res() res, @Param('id') id: string) {
    try {
      console.log('find by id');
      const room = await this.ratingService.findOne(id);
      return res.status(HttpStatus.CREATED).json(room);
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json(e);
    }
  }

  @Get('person-movie/id/:id')
  async findOnePersonOrMovieRating(@Res() res, @Param('id') id: string) {
    try {
      const rating = await this.ratingService.findOneByRoomPersonId(id);
      return res.status(HttpStatus.CREATED).json(rating);
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json(e);
    }
  }

  @UseGuards(LoginGuard)
  @Patch('rate/id/:id')
  async updateRating(@Res() res, @Req() req, @Param('id') id: string, @Body() dto: CreateRatingDto) {
    try {
      console.log('rating');
      const userId = req.user.decodedAccessToken.id;

      console.log(userId);

      const rate = await this.ratingService.updateMoviePersonRating(
        id,
        userId,
        dto.rating)
      return res.status(HttpStatus.CREATED).json(rate);
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json(e);
    }
  }
}
