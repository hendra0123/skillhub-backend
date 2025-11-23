import { Test, TestingModule } from '@nestjs/testing';
import { ParticipantsService } from './participants.service';
import { Participant } from './participant.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

const mockParticipantRepository = {
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  remove: jest.fn(),
};

describe('ParticipantsService', () => {
  let service: ParticipantsService;
  let repo: jest.Mocked<Repository<Participant>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ParticipantsService,
        {
          provide: getRepositoryToken(Participant),
          useValue: mockParticipantRepository,
        },
      ],
    }).compile();

    service = module.get<ParticipantsService>(ParticipantsService);
    repo = module.get(getRepositoryToken(Participant));

    jest.clearAllMocks();
  });

  const sampleParticipant: Participant = {
    id: 1,
    nim: 'A12345',
    full_name: 'Budi Santoso',
    email: 'budi@example.com',
    phone: '08123456789',
    created_at: new Date(),
    enrollments: [],
  };

  // --------------------------------------------------
  // create()
  // --------------------------------------------------
  it('create() should create and save a participant', async () => {
    const dto = {
      nim: 'A12345',
      full_name: 'Budi Santoso',
      email: 'budi@example.com',
      phone: '08123456789',
    };

    repo.create.mockReturnValue(dto as any);
    repo.save.mockResolvedValue(sampleParticipant as any);

    const result = await service.create(dto as any);

    expect(repo.create).toHaveBeenCalledWith(dto);
    expect(repo.save).toHaveBeenCalledWith(dto);
    expect(result).toEqual(sampleParticipant);
  });

  // --------------------------------------------------
  // findAll()
  // --------------------------------------------------
  it('findAll() should return an array of participants', async () => {
    repo.find.mockResolvedValue([sampleParticipant] as any);

    const result = await service.findAll();

    expect(repo.find).toHaveBeenCalledWith({
      order: { id: 'DESC' },
    });
    expect(result).toEqual([sampleParticipant]);
  });

  // --------------------------------------------------
  // findOne()
  // --------------------------------------------------
  it('findOne() should return a participant when found', async () => {
    repo.findOne.mockResolvedValue(sampleParticipant as any);

    const result = await service.findOne(1);

    expect(repo.findOne).toHaveBeenCalledWith({
      where: { id: 1 },
      relations: ['enrollments', 'enrollments.classEntity'],
    });
    expect(result).toEqual(sampleParticipant);
  });

  it('findOne() should throw NotFoundException when participant not found', async () => {
    repo.findOne.mockResolvedValue(null as any);

    await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
  });

  // --------------------------------------------------
  // update()
  // --------------------------------------------------
  it('update() should merge data and save participant', async () => {
    const existing = { ...sampleParticipant };
    const updatedDto = { full_name: 'Nama Baru' };

    const findOneSpy = jest
      .spyOn(service, 'findOne')
      .mockResolvedValue(existing as any);

    repo.save.mockResolvedValue({ ...existing, ...updatedDto } as any);

    const result = await service.update(1, updatedDto as any);

    expect(findOneSpy).toHaveBeenCalledWith(1);
    expect(repo.save).toHaveBeenCalledWith({
      ...existing,
      ...updatedDto,
    });
    expect(result.full_name).toBe('Nama Baru');
  });

  // --------------------------------------------------
  // remove()
  // --------------------------------------------------
  it('remove() should call repository.remove with found participant', async () => {
    const existing = { ...sampleParticipant };

    const findOneSpy = jest
      .spyOn(service, 'findOne')
      .mockResolvedValue(existing as any);

    repo.remove.mockResolvedValue(undefined as any);

    await service.remove(1);

    expect(findOneSpy).toHaveBeenCalledWith(1);
    expect(repo.remove).toHaveBeenCalledWith(existing);
  });
});