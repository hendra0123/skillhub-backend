import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Participant } from './participant.entity';
import { CreateParticipantDto } from './dto/create-participant.dto';
import { UpdateParticipantDto } from './dto/update-participant.dto';

@Injectable()
export class ParticipantsService {
  constructor(
    @InjectRepository(Participant)
    private readonly participantRepo: Repository<Participant>,
  ) {}

  // --------------------------------------------------
  // CREATE
  // --------------------------------------------------
  async create(createDto: CreateParticipantDto): Promise<Participant> {
    // Fallback extra check: kalau suatu saat ValidationPipe/DTO mati,
    // kita tetap punya pengecekan field kosong + info field mana yang kurang.
    const missingFields: string[] = [];
    if (!createDto.nim) missingFields.push('nim');
    if (!createDto.full_name) missingFields.push('full_name');
    if (!createDto.email) missingFields.push('email');
    if (!createDto.phone) missingFields.push('phone');

    if (missingFields.length > 0) {
      throw new BadRequestException(
        `Field berikut wajib diisi: ${missingFields.join(', ')}.`,
      );
    }

    const participant = this.participantRepo.create(createDto);

    try {
      return await this.participantRepo.save(participant);
    } catch (err: any) {
      if (err.code === 'ER_DUP_ENTRY') {
        throw new ConflictException(
          'NIM atau email sudah terdaftar. Silakan gunakan data lain.',
        );
      }

      throw new InternalServerErrorException('Gagal membuat data peserta.');
    }
  }

  // --------------------------------------------------
  // FIND ALL
  // --------------------------------------------------
  async findAll(): Promise<Participant[]> {
    try {
      return await this.participantRepo.find({
        order: { id: 'DESC' },
      });
    } catch {
      throw new InternalServerErrorException('Gagal mengambil data peserta.');
    }
  }

  // --------------------------------------------------
  // FIND ONE
  // --------------------------------------------------
  async findOne(id: number): Promise<Participant> {
    let participant: Participant | null;

    try {
      participant = await this.participantRepo.findOne({
        where: { id },
        relations: ['enrollments', 'enrollments.classEntity'],
      });
    } catch {
      throw new InternalServerErrorException('Gagal mengambil data peserta.');
    }

    if (!participant) {
      throw new NotFoundException(`Participant with id ${id} not found`);
    }

    return participant;
  }

  // --------------------------------------------------
  // UPDATE
  // --------------------------------------------------
  async update(
    id: number,
    updateDto: UpdateParticipantDto,
  ): Promise<Participant> {
    const participant = await this.findOne(id); // 404 kalau nggak ada

    Object.assign(participant, updateDto);

    const missingFields: string[] = [];
    if (!participant.nim) missingFields.push('nim');
    if (!participant.full_name) missingFields.push('full_name');
    if (!participant.email) missingFields.push('email');
    if (!participant.phone) missingFields.push('phone');

    if (missingFields.length > 0) {
      throw new BadRequestException(
        `Field berikut wajib diisi: ${missingFields.join(', ')}.`,
      );
    }

    try {
      return await this.participantRepo.save(participant);
    } catch (err: any) {
      if (err.code === 'ER_DUP_ENTRY') {
        throw new ConflictException(
          'NIM atau email sudah terdaftar. Silakan gunakan data lain.',
        );
      }

      throw new InternalServerErrorException('Gagal mengubah data peserta.');
    }
  }

  // --------------------------------------------------
  // REMOVE
  // --------------------------------------------------
  async remove(id: number): Promise<void> {
    const participant = await this.findOne(id);

    try {
      await this.participantRepo.remove(participant);
    } catch {
      throw new InternalServerErrorException('Gagal menghapus data peserta.');
    }
  }
}
