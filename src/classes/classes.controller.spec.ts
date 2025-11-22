import { Test, TestingModule } from '@nestjs/testing';
import { ClassesController } from './classes.controller';
import { ClassesService } from './classes.service';
import { NotFoundException } from '@nestjs/common';

describe('ClassesController', () => {
  let controller: ClassesController;
  let service: jest.Mocked<ClassesService>;

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const sampleClass = {
    id: 1,
    name: 'Pemrograman Web',
    description: 'Kelas dasar web',
    instructor: 'Pak Joko',
    status: 'aktif',
    created_at: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClassesController],
      providers: [
        {
          provide: ClassesService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<ClassesController>(ClassesController);
    service = module.get(ClassesService);

    jest.clearAllMocks();
  });

  // --------------------------------------------------
  // POST /classes
  // --------------------------------------------------
  it('create() should call service.create and return result', async () => {
    const dto = {
      name: 'Pemrograman Web',
      description: 'Kelas dasar web',
      instructor: 'Pak Joko',
      status: 'aktif',
    };

    service.create.mockResolvedValue(sampleClass as any);

    const result = await controller.create(dto as any);

    expect(service.create).toHaveBeenCalledWith(dto);
    expect(result).toEqual(sampleClass);
  });

  // --------------------------------------------------
  // GET /classes
  // --------------------------------------------------
  it('findAll() should return array of classes', async () => {
    service.findAll.mockResolvedValue([sampleClass] as any);

    const result = await controller.findAll();

    expect(service.findAll).toHaveBeenCalled();
    expect(result).toEqual([sampleClass]);
  });

  // --------------------------------------------------
  // GET /classes/:id
  // --------------------------------------------------
  it('findOne() should return a class by id', async () => {
    service.findOne.mockResolvedValue(sampleClass as any);

    const result = await controller.findOne(1);

    expect(service.findOne).toHaveBeenCalledWith(1);
    expect(result).toEqual(sampleClass);
  });

  it('findOne() should throw NotFoundException if class not found', async () => {
    service.findOne.mockRejectedValue(new NotFoundException());

    await expect(controller.findOne(999)).rejects.toThrow(NotFoundException);
  });

  // --------------------------------------------------
  // PATCH /classes/:id
  // --------------------------------------------------
  it('update() should call service.update and return updated class', async () => {
    const updateDto = { name: 'Pemrograman Lanjut' };

    service.update.mockResolvedValue({
      ...sampleClass,
      name: 'Pemrograman Lanjut',
    } as any);

    const result = await controller.update(1, updateDto as any);

    expect(service.update).toHaveBeenCalledWith(1, updateDto);
    expect(result.name).toBe('Pemrograman Lanjut');
  });

  // --------------------------------------------------
  // DELETE /classes/:id
  // --------------------------------------------------
  it('remove() should call service.remove and return success message', async () => {
    service.remove.mockResolvedValue(undefined);

    const result = await controller.remove(1);

    expect(service.remove).toHaveBeenCalledWith(1);
    expect(result).toEqual({ message: 'Class deleted successfully' });
  });
});