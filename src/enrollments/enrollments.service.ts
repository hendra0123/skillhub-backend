import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Enrollment } from './enrollment.entity';
import { Participant } from '../participants/participant.entity';
import { ClassEntity } from '../classes/class.entity';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';

@Injectable()
export class EnrollmentsService {
  constructor(
    @InjectRepository(Enrollment)
    private readonly enrollmentRepo: Repository<Enrollment>,

    @InjectRepository(Participant)
    private readonly participantRepo: Repository<Participant>,

    @InjectRepository(ClassEntity)
    private readonly classRepo: Repository<ClassEntity>,
  ) {}

  async enroll(dto: CreateEnrollmentDto): Promise<Enrollment> {
    const participant = await this.participantRepo.findOne({ where: { id: dto.participant_id }});
    const classEntity = await this.classRepo.findOne({ where: { id: dto.class_id }});

    if (!participant) throw new NotFoundException('Participant not found');
    if (!classEntity) throw new NotFoundException('Class not found');

    // Check duplicate enrollment
    const exists = await this.enrollmentRepo.findOne({
      where: { participant: { id: participant.id }, classEntity: { id: classEntity.id } },
      relations: ['participant', 'classEntity'],
    });

    if (exists) throw new BadRequestException('Participant already enrolled in this class');

    const enrollment = this.enrollmentRepo.create({
      participant,
      classEntity,
    });

    return this.enrollmentRepo.save(enrollment);
  }

  async remove(id: number): Promise<void> {
    const enrollment = await this.enrollmentRepo.findOne({ where: { id }});
    if (!enrollment) throw new NotFoundException('Enrollment not found');

    await this.enrollmentRepo.remove(enrollment);
  }

  async getClassesByParticipant(id: number) {
    return this.enrollmentRepo.find({
      where: { participant: { id } },
      relations: ['classEntity'],
    });
  }

  async getParticipantsByClass(id: number) {
    return this.enrollmentRepo.find({
      where: { classEntity: { id } },
      relations: ['participant'],
    });
  }
}