import { IsArray, IsNotEmpty, IsNumber } from "class-validator";

export class CreateTournamentRegistrationDto {
  
  @IsArray()
  @IsNumber({}, { each: true })
  @IsNotEmpty()
  athlete_ids: number[];

/*   @IsNumber()
  @IsNotEmpty()
  division_id: number; */
  @IsNumber()
  @IsNotEmpty()
  event_id: number;

  @IsNumber()
  @IsNotEmpty()
  category_id: number; // ID de karateCategoriesTable (la categoría en la que participa)

  @IsNumber()
  @IsNotEmpty()
  modality_id: number;
}
