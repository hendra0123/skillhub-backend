import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClassEntity } from './class.entity';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';

@Injectable()
export class ClassesService {
  constructor(
    @InjectRepository(ClassEntity)
    private readonly classRepo: Repository<ClassEntity>,
  ) {}

  async create(createDto: CreateClassDto): Promise<ClassEntity> {
    const newClass = this.classRepo.create({
      ...createDto,
    });
    return this.classRepo.save(newClass);
  }

  async findAll(): Promise<ClassEntity[]> {
    return this.classRepo.find({
      order: { id: 'DESC' },
    });
  }

  async findOne(id: number): Promise<ClassEntity> {
    const classEntity = await this.classRepo.findOne({
      where: { id },
      relations: ['enrollments', 'enrollments.participant'],
    });

    if (!classEntity) {
      throw new NotFoundException(`Class with id ${id} not found`);
    }

    return classEntity;
  }

  async update(id: number, updateDto: UpdateClassDto): Promise<ClassEntity> {
    const classEntity = await this.findOne(id);
    Object.assign(classEntity, updateDto);
    return this.classRepo.save(classEntity);
  }

  async remove(id: number): Promise<void> {
    const classEntity = await this.classRepo.findOne({ where: { id } });

    if (!classEntity) {
      throw new NotFoundException(`Class with id ${id} not found`);
    }

    await this.classRepo.remove(classEntity);
  }
}