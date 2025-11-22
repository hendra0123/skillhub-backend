import { Test, TestingModule } from '@nestjs/testing';
import { EnrollmentsService } from './enrollments.service';
import { Enrollment } from './enrollment.entity';
import { Participant } from '../participants/participant.entity';
import { ClassEntity } from '../classes/class.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';

const mockRepo = () => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  remove: jest.fn(),
});

describe('EnrollmentsService', () => {
  let service: EnrollmentsService;
  let enrollmentRepo: jest.Mocked<Repository<Enrollment>>;
  let participantRepo: jest.Mocked<Repository<Participant>>;
  let classRepo: jest.Mocked<Repository<ClassEntity>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EnrollmentsService,
        {
          provide: getRepositoryToken(Enrollment),
          useValue: mockRepo(),
        },
        {
          provide: getRepositoryToken(Participant),
          useValue: mockRepo(),
        },
        {
          provide: getRepositoryToken(ClassEntity),
          useValue: mockRepo(),
        },
      ],
    }).compile();

    service = module.get<EnrollmentsService>(EnrollmentsService);
    enrollmentRepo = module.get(getRepositoryToken(Enrollment));
    participantRepo = module.get(getRepositoryToken(Participant));
    classRepo = module.get(getRepositoryToken(ClassEntity));

    jest.clearAllMocks();
  });

  const sampleParticipant: Participant = {
    id: 1,
    nim: 'A12345',
    full_name: 'Budi',
    email: 'budi@example.com',
    phone: '08123',
    created_at: new Date(),
    enrollments: [],
  };

  const sampleClass: ClassEntity = {
    id: 10,
    name: 'Pemrograman Web',
    description: 'desc',
    instructor: 'Pak Joko',
    status: 'aktif',
    created_at: new Date(),
    enrollments: [],
  };

  const sampleEnrollment: Enrollment = {
    id: 100,
    participant: sampleParticipant,
    classEntity: sampleClass,
    status: 'terdaftar',
    enrolled_at: new Date(),
  };

  // --------------------------------------------------
  // enroll()
  // --------------------------------------------------

  it('enroll() should create enrollment when participant & class exist and not duplicate', async () => {
    // participant & class ditemukan
    participantRepo.findOne.mockResolvedValue(sampleParticipant as any);
    classRepo.findOne.mockResolvedValue(sampleClass as any);
    // tidak ada enrollment existing
    enrollmentRepo.findOne.mockResolvedValue(null as any);
    // create & save
    enrollmentRepo.create.mockReturnValue(sampleEnrollment as any);
    enrollmentRepo.save.mockResolvedValue(sampleEnrollment as any);

    const dto = { participant_id: 1, class_id: 10 };

    const result = await service.enroll(dto);

    expect(participantRepo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    expect(classRepo.findOne).toHaveBeenCalledWith({ where: { id: 10 } });
    expect(enrollmentRepo.findOne).toHaveBeenCalledWith({
      where: { participant: { id: 1 }, classEntity: { id: 10 } },
      relations: ['participant', 'classEntity'],
    });
    expect(enrollmentRepo.create).toHaveBeenCalledWith({
      participant: sampleParticipant,
      classEntity: sampleClass,
    });
    expect(enrollmentRepo.save).toHaveBeenCalled();
    expect(result).toEqual(sampleEnrollment);
  });

  it('enroll() should throw NotFoundException if participant not found', async () => {
    participantRepo.findOne.mockResolvedValue(null as any);
    classRepo.findOne.mockResolvedValue(sampleClass as any);

    const dto = { participant_id: 999, class_id: 10 };

    await expect(service.enroll(dto as any)).rejects.toThrow(NotFoundException);
    expect(participantRepo.findOne).toHaveBeenCalledWith({ where: { id: 999 } });
  });

  it('enroll() should throw NotFoundException if class not found', async () => {
    participantRepo.findOne.mockResolvedValue(sampleParticipant as any);
    classRepo.findOne.mockResolvedValue(null as any);

    const dto = { participant_id: 1, class_id: 999 };

    await expect(service.enroll(dto as any)).rejects.toThrow(NotFoundException);
    expect(classRepo.findOne).toHaveBeenCalledWith({ where: { id: 999 } });
  });

  it('enroll() should throw BadRequestException if already enrolled', async () => {
    participantRepo.findOne.mockResolvedValue(sampleParticipant as any);
    classRepo.findOne.mockResolvedValue(sampleClass as any);
    // simulate existing enrollment
    enrollmentRepo.findOne.mockResolvedValue(sampleEnrollment as any);

    const dto = { participant_id: 1, class_id: 10 };

    await expect(service.enroll(dto as any)).rejects.toThrow(BadRequestException);
  });

  // --------------------------------------------------
  // remove()
  // --------------------------------------------------

  it('remove() should remove enrollment when found', async () => {
    enrollmentRepo.findOne.mockResolvedValue(sampleEnrollment as any);
    enrollmentRepo.remove.mockResolvedValue(undefined as any);

    await service.remove(100);

    expect(enrollmentRepo.findOne).toHaveBeenCalledWith({ where: { id: 100 } });
    expect(enrollmentRepo.remove).toHaveBeenCalledWith(sampleEnrollment);
  });

  it('remove() should throw NotFoundException when enrollment not found', async () => {
    enrollmentRepo.findOne.mockResolvedValue(null as any);

    await expect(service.remove(999)).rejects.toThrow(NotFoundException);
  });

  // --------------------------------------------------
  // getClassesByParticipant()
  // --------------------------------------------------

  it('getClassesByParticipant() should call repository.find with correct where & relations', async () => {
    enrollmentRepo.find.mockResolvedValue([sampleEnrollment] as any);

    const result = await service.getClassesByParticipant(1);

    expect(enrollmentRepo.find).toHaveBeenCalledWith({
      where: { participant: { id: 1 } },
      relations: ['classEntity'],
    });
    expect(result).toEqual([sampleEnrollment]);
  });

  // --------------------------------------------------
  // getParticipantsByClass()
  // --------------------------------------------------

  it('getParticipantsByClass() should call repository.find with correct where & relations', async () => {
    enrollmentRepo.find.mockResolvedValue([sampleEnrollment] as any);

    const result = await service.getParticipantsByClass(10);

    expect(enrollmentRepo.find).toHaveBeenCalledWith({
      where: { classEntity: { id: 10 } },
      relations: ['participant'],
    });
    expect(result).toEqual([sampleEnrollment]);
  });
});