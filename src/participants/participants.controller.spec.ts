import { Test, TestingModule } from '@nestjs/testing';
import { ParticipantsController } from './participants.controller';
import { ParticipantsService } from './participants.service';
import { NotFoundException } from '@nestjs/common';

describe('ParticipantsController', () => {
  let controller: ParticipantsController;
  let service: jest.Mocked<ParticipantsService>;

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const sampleParticipant = {
    id: 1,
    nim: 'A12345',
    full_name: 'Budi Santoso',
    email: 'budi@example.com',
    phone: '08123456789',
    created_at: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ParticipantsController],
      providers: [
        {
          provide: ParticipantsService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<ParticipantsController>(ParticipantsController);
    service = module.get(ParticipantsService);
    jest.clearAllMocks();
  });

  // --------------------------------------------------
  // CREATE
  // --------------------------------------------------
  it('create() should call service.create and return result', async () => {
    const dto = {
      nim: 'A12345',
      full_name: 'Budi Santoso',
      email: 'budi@example.com',
      phone: '08123456789',
    };

    service.create.mockResolvedValue(sampleParticipant as any);
    const result = await controller.create(dto as any);

    expect(service.create).toHaveBeenCalledWith(dto);
    expect(result).toEqual(sampleParticipant);
  });

  // --------------------------------------------------
  // FIND ALL
  // --------------------------------------------------
  it('findAll() should return array of participants', async () => {
    service.findAll.mockResolvedValue([sampleParticipant] as any);

    const result = await controller.findAll();

    expect(service.findAll).toHaveBeenCalled();
    expect(result).toEqual([sampleParticipant]);
  });

  // --------------------------------------------------
  // FIND ONE
  // --------------------------------------------------
  it('findOne() should return a participant by id', async () => {
    service.findOne.mockResolvedValue(sampleParticipant as any);

    const result = await controller.findOne(1);

    expect(service.findOne).toHaveBeenCalledWith(1);
    expect(result).toEqual(sampleParticipant);
  });

  it('findOne() should throw error if not found', async () => {
    service.findOne.mockRejectedValue(new NotFoundException());

    await expect(controller.findOne(99)).rejects.toThrow(NotFoundException);
  });

  // --------------------------------------------------
  // UPDATE
  // --------------------------------------------------
  it('update() should call service.update and return updated result', async () => {
    const updateDto = { full_name: 'Nama Baru' };

    service.update.mockResolvedValue({
      ...sampleParticipant,
      full_name: 'Nama Baru',
    } as any);

    const result = await controller.update(1, updateDto as any);

    expect(service.update).toHaveBeenCalledWith(1, updateDto);
    expect(result.full_name).toEqual('Nama Baru');
  });

  // --------------------------------------------------
  // REMOVE
  // --------------------------------------------------
  it('remove() should call service.remove and return success message', async () => {
    service.remove.mockResolvedValue(undefined);

    const result = await controller.remove(1);

    expect(service.remove).toHaveBeenCalledWith(1);
    expect(result).toEqual({ message: 'Participant deleted successfully' });
  });
});
