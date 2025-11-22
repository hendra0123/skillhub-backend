import { Test, TestingModule } from '@nestjs/testing';
import { ClassesService } from './classes.service';
import { ClassEntity } from './class.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

const mockRepo = () => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  remove: jest.fn(),
});

describe('ClassesService', () => {
  let service: ClassesService;
  let repo: jest.Mocked<Repository<ClassEntity>>;

  const sampleClass: ClassEntity = {
    id: 1,
    name: 'Pemrograman Web',
    description: 'Kelas dasar web',
    instructor: 'Pak Joko',
    status: 'aktif',
    created_at: new Date(),
    enrollments: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClassesService,
        {
          provide: getRepositoryToken(ClassEntity),
          useValue: mockRepo(),
        },
      ],
    }).compile();

    service = module.get<ClassesService>(ClassesService);
    repo = module.get(getRepositoryToken(ClassEntity));

    jest.clearAllMocks();
  });

  // --------------------------------------------------
  // create()
  // --------------------------------------------------
  it('create() should create and save a class entity', async () => {
    const dto = {
      name: 'Pemrograman Web',
      description: 'Kelas dasar web',
      instructor: 'Pak Joko',
      status: 'aktif',
    };

    repo.create.mockReturnValue(dto as any);
    repo.save.mockResolvedValue(sampleClass as any);

    const result = await service.create(dto as any);

    expect(repo.create).toHaveBeenCalledWith({ ...dto });
    expect(repo.save).toHaveBeenCalledWith(dto);
    expect(result).toEqual(sampleClass);
  });

  // --------------------------------------------------
  // findAll()
  // --------------------------------------------------
  it('findAll() should return an array of classes', async () => {
    repo.find.mockResolvedValue([sampleClass] as any);

    const result = await service.findAll();

    expect(repo.find).toHaveBeenCalledWith({
      order: { id: 'DESC' },
    });
    expect(result).toEqual([sampleClass]);
  });

  // --------------------------------------------------
  // findOne()
  // --------------------------------------------------
  it('findOne() should return a class when found', async () => {
    repo.findOne.mockResolvedValue(sampleClass as any);

    const result = await service.findOne(1);

    expect(repo.findOne).toHaveBeenCalledWith({
      where: { id: 1 },
      relations: ['enrollments', 'enrollments.participant'],
    });
    expect(result).toEqual(sampleClass);
  });

  it('findOne() should throw NotFoundException when class not found', async () => {
    repo.findOne.mockResolvedValue(null as any);

    await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
  });

  // --------------------------------------------------
  // update()
  // --------------------------------------------------
  it('update() should merge data and save class entity', async () => {
    const existing = { ...sampleClass };
    const updateDto = { name: 'Pemrograman Lanjut' };

    const findOneSpy = jest
      .spyOn(service, 'findOne')
      .mockResolvedValue(existing as any);

    repo.save.mockResolvedValue({ ...existing, ...updateDto } as any);

    const result = await service.update(1, updateDto as any);

    expect(findOneSpy).toHaveBeenCalledWith(1);
    expect(repo.save).toHaveBeenCalledWith({
      ...existing,
      ...updateDto,
    });
    expect(result.name).toBe('Pemrograman Lanjut');
  });

  // --------------------------------------------------
  // remove()
  // --------------------------------------------------
  it('remove() should remove class when found', async () => {
    repo.findOne.mockResolvedValue(sampleClass as any);
    repo.remove.mockResolvedValue(undefined as any);

    await service.remove(1);

    expect(repo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    expect(repo.remove).toHaveBeenCalledWith(sampleClass);
  });

  it('remove() should throw NotFoundException when class not found', async () => {
    repo.findOne.mockResolvedValue(null as any);

    await expect(service.remove(999)).rejects.toThrow(NotFoundException);
  });
});