import { Test, TestingModule } from '@nestjs/testing';
import { SpeciesService } from './species.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConflictException, NotFoundException } from '@nestjs/common';

const mockPrismaService = {
    species: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    },
};

describe('SpeciesService', () => {
    let service: SpeciesService;
    let prisma: typeof mockPrismaService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SpeciesService,
                { provide: PrismaService, useValue: mockPrismaService },
            ],
        }).compile();

        service = module.get<SpeciesService>(SpeciesService);
        prisma = module.get(PrismaService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('should create a new species successfully', async () => {
            const dto = { name: 'Tambaqui' };
            const createdSpecies = { id: '1', ...dto };
            prisma.species.findUnique.mockResolvedValue(null);
            prisma.species.create.mockResolvedValue(createdSpecies);

            const result = await service.create(dto as any);

            expect(prisma.species.findUnique).toHaveBeenCalledWith({ where: { name: 'Tambaqui' } });
            expect(prisma.species.create).toHaveBeenCalledWith({ data: dto });
            expect(result).toEqual(createdSpecies);
        });

        it('should throw ConflictException if species name already exists', async () => {
            const dto = { name: 'Tambaqui' };
            prisma.species.findUnique.mockResolvedValue({ id: '1', name: 'Tambaqui' });

            await expect(service.create(dto as any)).rejects.toThrow(ConflictException);
        });
    });

    describe('findAll', () => {
        it('should return a list of species', async () => {
            const speciesList = [{ id: '1', name: 'Tambaqui' }];
            prisma.species.findMany.mockResolvedValue(speciesList);

            const result = await service.findAll();
            expect(prisma.species.findMany).toHaveBeenCalledWith({ orderBy: { name: 'asc' } });
            expect(result).toEqual(speciesList);
        });
    });

    describe('findOne', () => {
        it('should return a single species', async () => {
            const species = { id: '1', name: 'Tambaqui' };
            prisma.species.findUnique.mockResolvedValue(species);

            const result = await service.findOne('1');
            expect(prisma.species.findUnique).toHaveBeenCalledWith({ where: { id: '1' } });
            expect(result).toEqual(species);
        });

        it('should throw NotFoundException if species is not found', async () => {
            prisma.species.findUnique.mockResolvedValue(null);
            await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
        });
    });

    describe('update', () => {
        it('should update a species successfully', async () => {
            const existing = { id: '1', name: 'Tambaqui' };
            const dto = { name: 'Pacu' };

            // For findOne internal call
            prisma.species.findUnique.mockImplementation(({ where }) => {
                if (where.id === '1') return Promise.resolve(existing);
                if (where.name === 'Pacu') return Promise.resolve(null);
                return Promise.resolve(null);
            });

            prisma.species.update.mockResolvedValue({ ...existing, ...dto });

            const result = await service.update('1', dto);
            expect(prisma.species.update).toHaveBeenCalledWith({ where: { id: '1' }, data: dto });
            expect(result.name).toBe('Pacu');
        });

        it('should throw ConflictException if trying to update to an existing name', async () => {
            const existing = { id: '1', name: 'Tambaqui' };
            const otherSpecies = { id: '2', name: 'Pacu' };
            const dto = { name: 'Pacu' };

            prisma.species.findUnique.mockImplementation(({ where }) => {
                if (where.id === '1') return Promise.resolve(existing);
                if (where.name === 'Pacu') return Promise.resolve(otherSpecies);
                return Promise.resolve(null);
            });

            await expect(service.update('1', dto)).rejects.toThrow(ConflictException);
        });
    });

    describe('remove', () => {
        it('should remove a species successfully', async () => {
            const existing = { id: '1', name: 'Tambaqui' };
            prisma.species.findUnique.mockResolvedValue(existing);
            prisma.species.delete.mockResolvedValue(existing);

            const result = await service.remove('1');
            expect(prisma.species.delete).toHaveBeenCalledWith({ where: { id: '1' } });
            expect(result).toEqual(existing);
        });
    });
});
