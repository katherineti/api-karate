import { IsBoolean, IsNotEmpty } from 'class-validator';

export class ChangeStatusSchoolDto {
  @IsBoolean()
  @IsNotEmpty()
  isActive: boolean;
}