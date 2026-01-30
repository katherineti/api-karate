import { IsOptional, IsString, IsInt, Min } from 'class-validator';

export class PaginationSchoolsDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  limit: number = 10;

  @IsOptional()
  @IsString()
  search?: string;
}