import {
  Controller,
  Post,
  Delete,
  Param,
  ParseIntPipe,
  Body,
  Get,
} from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';

@Controller('enrollments')
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Post()
  async enroll(@Body() dto: CreateEnrollmentDto) {
    return this.enrollmentsService.enroll(dto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.enrollmentsService.remove(id);
    return { message: 'Enrollment deleted successfully' };
  }

  @Get('/participant/:id')
  async getClasses(@Param('id', ParseIntPipe) id: number) {
    return this.enrollmentsService.getClassesByParticipant(id);
  }

  @Get('/class/:id')
  async getParticipants(@Param('id', ParseIntPipe) id: number) {
    return this.enrollmentsService.getParticipantsByClass(id);
  }
}