import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { Enrollment } from '../enrollments/enrollment.entity';

@Entity('participants')
export class Participant {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  nim: string;

  @Column()
  full_name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  phone: string;

  @CreateDateColumn()
  created_at: Date;

  // Relasi: ONE participant bisa punya banyak enrollment
  @OneToMany(() => Enrollment, (enrollment) => enrollment.participant)
  enrollments: Enrollment[];
}
