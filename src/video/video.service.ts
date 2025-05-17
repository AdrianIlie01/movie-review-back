import { BadRequestException, Injectable } from '@nestjs/common';
import { UpdateVideoDto } from './dto/update-video.dto';
import { UserEntity } from '../user/entities/user.entity';
import { VideoEntity } from './entities/video.entity';
import { Express } from 'express';
import { CreateVideoDto } from './dto/create-video.dto';

@Injectable()
export class VideoService {
  async create(id, file: Express.Multer.File, createVideoDto: CreateVideoDto) {
    try {
      const { room_name } = createVideoDto;
      const user = await UserEntity.findOneBy({ id: id });

      if (room_name.trim().length == 0) {
        throw new BadRequestException({ message: 'room name is empty' });
      }

      if (file) {
        const video = await new VideoEntity();
        video.room_name = room_name;
        video.name = file.filename;
        video.user = user;
        return await video.save();
      }
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async findAll() {
    try {
      return await VideoEntity.find();
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async findOne(id: string) {
    try {
      const video = await VideoEntity.findOneBy({ id: +id });

      console.log('video');
      console.log(video);

      return video;
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async update(id: number, updateVideoDto: UpdateVideoDto) {
    try {
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async remove(id: number) {
    try {
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }
}
