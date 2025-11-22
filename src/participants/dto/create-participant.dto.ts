import {
  IsEmail,
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
  Length
} from 'class-validator';

export class CreateParticipantDto {
  @IsString()
  @IsNotEmpty()
  nim: string;

  @IsString()
  @IsNotEmpty()
  @Length(3, 100)
  full_name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsPhoneNumber('ID')
  @IsNotEmpty()
  phone: string;
}