import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  Unique,
} from 'typeorm';
import { Participant } from '../participants/participant.entity';
import { ClassEntity } from '../classes/class.entity';

@Entity('enrollments')
@Unique(['participant', 'classEntity'])
export class Enrollment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Participant, (participant) => participant.enrollments, {
    onDelete: 'CASCADE',
  })
  participant: Participant;

  @ManyToOne(() => ClassEntity, (classEntity) => classEntity.enrollments, {
    onDelete: 'CASCADE',
  })
  classEntity: ClassEntity;

  @Column({ default: 'terdaftar' })
  status: string;

  @CreateDateColumn()
  enrolled_at: Date;
}
