import { IsNumber, IsNotEmpty, Min } from 'class-validator';

export class CreateParticipantRequestDto {
  @IsNumber()
  @IsNotEmpty()
  event_id: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  num_participants_requested: number; // El número total de atletas que quiere llevar

//   @IsString()
//   @IsOptional()
//   message?: string; // Ej: "Nuestra delegación aumentó por los nuevos cinturones amarillos"
}