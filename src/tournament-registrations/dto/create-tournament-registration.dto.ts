import { IsArray, IsNotEmpty, IsNumber } from "class-validator";

export class CreateTournamentRegistrationDto {
  @IsNumber()
  @IsNotEmpty()
  division_id: number;

  @IsArray()
  @IsNumber({}, { each: true })
  @IsNotEmpty()
  athlete_ids: number[];
}
