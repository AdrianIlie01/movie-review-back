import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Stripe } from "stripe";
import { PersonEntity } from "../../person/entities/person.entity";
import { RoomEntity } from "../../room/entities/room.entity";
import { UserEntity } from "../../user/entities/user.entity";
import { RatingType } from "../../shared/rating-type";
import { MovieType } from "../../shared/movie-type";
import { MoviePersonRole } from "../../shared/movie-person-role";

@Entity('rating')
export class RatingEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column({ type: 'float', default : 0 })
  rating: number;

  // @Column({ type: 'int', default : 0 })
  // ratingsCount: number;

  // @Column({type: 'enum', enum: RatingType, nullable: false})
  // type: RatingType;

  @Column({ type: 'simple-array', nullable: true })
  type: (MovieType | MoviePersonRole)[];

@ManyToOne( () => RoomEntity, (room: RoomEntity) => room.ratings, {eager: true})
  @JoinColumn({name: 'room', referencedColumnName: 'id'})
  room?: RoomEntity;

  @ManyToOne(() => PersonEntity, (person: PersonEntity) => person.ratings, {eager: true})
  @JoinColumn({name: 'person', referencedColumnName: 'id'})
  person?: PersonEntity;
}
