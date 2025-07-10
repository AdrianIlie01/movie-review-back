import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { PersonEntity } from "../../person/entities/person.entity";
import { RoomEntity } from "../../room/entities/room.entity";
import { MoviePersonRole } from "../../shared/movie-person-role";

@Entity('movie_person')
export class MoviePersonEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => RoomEntity, room => room.movieRoles, { eager: true, onDelete: 'CASCADE' })
  room: RoomEntity;

  @ManyToOne(() => PersonEntity, person => person.movieRoles, { eager: true, onDelete: 'CASCADE' })
  person: PersonEntity;

  @Column({ type: 'enum', enum: MoviePersonRole })
  person_role: MoviePersonRole;
}
