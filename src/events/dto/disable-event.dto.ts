import { IsOptional, IsString, MaxLength } from 'class-validator';

export class DisableEventDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}