import { Test, TestingModule } from '@nestjs/testing';
import { EnrollmentsController } from './enrollments.controller';
import { EnrollmentsService } from './enrollments.service';

describe('EnrollmentsController', () => {
  let controller: EnrollmentsController;
  let service: jest.Mocked<EnrollmentsService>;

  const mockService = {
    enroll: jest.fn(),
    remove: jest.fn(),
    getClassesByParticipant: jest.fn(),
    getParticipantsByClass: jest.fn(),
  };

  const sampleEnrollment = {
    id: 1,
    status: 'terdaftar',
    enrolled_at: new Date(),
    participant: { id: 2 },
    classEntity: { id: 3 },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EnrollmentsController],
      providers: [
        {
          provide: EnrollmentsService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<EnrollmentsController>(EnrollmentsController);
    service = module.get(EnrollmentsService);

    jest.clearAllMocks();
  });

  // --------------------------------------------------
  // POST /enrollments
  // --------------------------------------------------
  it('enroll() should call service.enroll and return result', async () => {
    const dto = { participant_id: 2, class_id: 3 };
    service.enroll.mockResolvedValue(sampleEnrollment as any);

    const result = await controller.enroll(dto as any);

    expect(service.enroll).toHaveBeenCalledWith(dto);
    expect(result).toEqual(sampleEnrollment);
  });

  // --------------------------------------------------
  // DELETE /enrollments/:id
  // --------------------------------------------------
  it('remove() should call service.remove and return success message', async () => {
    service.remove.mockResolvedValue(undefined);

    const result = await controller.remove(1);

    expect(service.remove).toHaveBeenCalledWith(1);
    expect(result).toEqual({ message: 'Enrollment deleted successfully' });
  });

  // --------------------------------------------------
  // GET /enrollments/participant/:id
  // --------------------------------------------------
  it('getClasses() should call service.getClassesByParticipant and return list', async () => {
    const list = [sampleEnrollment];
    service.getClassesByParticipant.mockResolvedValue(list as any);

    const result = await controller.getClasses(2);

    expect(service.getClassesByParticipant).toHaveBeenCalledWith(2);
    expect(result).toEqual(list);
  });

  // --------------------------------------------------
  // GET /enrollments/class/:id
  // --------------------------------------------------
  it('getParticipants() should call service.getParticipantsByClass and return list', async () => {
    const list = [sampleEnrollment];
    service.getParticipantsByClass.mockResolvedValue(list as any);

    const result = await controller.getParticipants(3);

    expect(service.getParticipantsByClass).toHaveBeenCalledWith(3);
    expect(result).toEqual(list);
  });
});
