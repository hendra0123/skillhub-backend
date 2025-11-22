import { IsInt, IsNotEmpty } from 'class-validator';

export class CreateEnrollmentDto {
  @IsInt()
  @IsNotEmpty()
  participant_id: number;

  @IsInt()
  @IsNotEmpty()
  class_id: number;
}
