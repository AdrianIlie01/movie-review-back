import { BaseEntity, Column, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { MoviePersonEntity } from "../../movie-person/entities/movie-person.entity";
import { MoviePersonRole } from "../../shared/movie-person-role";
import { RatingEntity } from "../../rating/entities/rating.entity";
@Entity('room')
export class RoomEntity extends BaseEntity {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true, nullable: false })
  name: string;

  @Column({ type: 'varchar' })
  stream_url: string;

  @Column({ type: 'varchar', nullable: true })
  thumbnail: string;

  @Column({ type: 'simple-array', nullable: true })
  type: string[];

  @Column({ type: 'varchar', nullable: true })
  release_year: string;

  @OneToMany(() => MoviePersonEntity, mp => mp.room, { cascade: true })
  movieRoles: MoviePersonEntity[];

  @OneToOne(() => RatingEntity, (ratingEntity: RatingEntity) => ratingEntity.room)
  rating: RatingEntity;
}
