import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSpeciesDto } from './dto/create-species.dto';
import { UpdateSpeciesDto } from './dto/update-species.dto';

@Injectable()
export class SpeciesService {
    constructor(private readonly prisma: PrismaService) { }

    async create(createSpeciesDto: CreateSpeciesDto) {
        const existing = await this.prisma.species.findUnique({
            where: { name: createSpeciesDto.name },
        });
        if (existing) {
            throw new ConflictException('Species with this name already exists');
        }

        return this.prisma.species.create({
            data: createSpeciesDto,
        });
    }

    async findAll() {
        return this.prisma.species.findMany({
            orderBy: { name: 'asc' },
        });
    }

    async findOne(id: string) {
        const species = await this.prisma.species.findUnique({
            where: { id },
        });
        if (!species) {
            throw new NotFoundException('Species not found');
        }
        return species;
    }

    async update(id: string, updateSpeciesDto: UpdateSpeciesDto) {
        await this.findOne(id);

        if (updateSpeciesDto.name) {
            const existing = await this.prisma.species.findUnique({
                where: { name: updateSpeciesDto.name },
            });
            if (existing && existing.id !== id) {
                throw new ConflictException('Species with this name already exists');
            }
        }

        return this.prisma.species.update({
            where: { id },
            data: updateSpeciesDto,
        });
    }

    async remove(id: string) {
        // Ensure the species exists
        await this.findOne(id);

        return this.prisma.species.delete({
            where: { id },
        });
    }
}
