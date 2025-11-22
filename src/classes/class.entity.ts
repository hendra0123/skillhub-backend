import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { Enrollment } from '../enrollments/enrollment.entity';

@Entity('classes')
export class ClassEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column()
  instructor: string;

  @Column({ default: 'aktif' })
  status: string;

  @CreateDateColumn()
  created_at: Date;

  // Relasi: ONE class bisa punya banyak participants lewat enrollment
  @OneToMany(() => Enrollment, (enrollment) => enrollment.classEntity)
  enrollments: Enrollment[];
}