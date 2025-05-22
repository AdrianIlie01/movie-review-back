import { BaseEntity, Column, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { RoomEntity } from "../../room/entities/room.entity";
import { MoviePersonEntity } from "../../movie-person/entities/movie-person.entity";
import { RatingEntity } from "../../rating/entities/rating.entity";
import { UserInfoEntity } from "../../user-info/entities/user-info.entity";
import { MoviePersonRole } from "../../shared/movie-person-role";

@Entity('person')
export class PersonEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'date', nullable: true })
  born?: Date;

  @Column({ type: 'simple-array', nullable: true })
  images?: string[];


  @Column({ type: 'simple-array', nullable: true })
  roles: MoviePersonRole[];

  // @Column({ type: 'enum', enum: MoviePersonRole })
  // roles: MoviePersonRole[];

  @OneToMany(() => MoviePersonEntity, mp => mp.person)
  movieRoles: MoviePersonEntity[];


  @OneToOne(() => RatingEntity, (ratingEntity: RatingEntity) => ratingEntity.person)
  rating: RatingEntity;
}
