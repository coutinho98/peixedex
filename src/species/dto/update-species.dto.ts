import { IsOptional, IsString } from 'class-validator';

export class UpdateSpeciesDto {
    @IsString()
    @IsOptional()
    name?: string;

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
