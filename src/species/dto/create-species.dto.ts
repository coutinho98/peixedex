import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateSpeciesDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  scientificName?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  habitat?: string;
}
