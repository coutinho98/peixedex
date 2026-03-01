import { Test, TestingModule } from '@nestjs/testing';
import { SpeciesController } from './species.controller';
import { SpeciesService } from './species.service';

describe('SpeciesController', () => {
    let controller: SpeciesController;
    let service: SpeciesService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [SpeciesController],
            providers: [
                {
                    provide: SpeciesService,
                    useValue: {
                        create: jest.fn().mockResolvedValue({ id: '1', name: 'Tambaqui' }),
                        findAll: jest.fn().mockResolvedValue([{ id: '1', name: 'Tambaqui' }]),
                        findOne: jest.fn().mockResolvedValue({ id: '1', name: 'Tambaqui' }),
                        update: jest.fn().mockResolvedValue({ id: '1', name: 'Pacu' }),
                        remove: jest.fn().mockResolvedValue({ id: '1', name: 'Tambaqui' }),
                    },
                },
            ],
        }).compile();

        controller = module.get<SpeciesController>(SpeciesController);
        service = module.get<SpeciesService>(SpeciesService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('should create a species', async () => {
        const dto = { name: 'Tambaqui' };
        expect(await controller.create(dto)).toEqual({ id: '1', name: 'Tambaqui' });
        expect(service.create).toHaveBeenCalledWith(dto);
    });

    it('should find all species', async () => {
        expect(await controller.findAll()).toEqual([{ id: '1', name: 'Tambaqui' }]);
        expect(service.findAll).toHaveBeenCalledWith();
    });

    it('should find one species', async () => {
        expect(await controller.findOne('1')).toEqual({ id: '1', name: 'Tambaqui' });
        expect(service.findOne).toHaveBeenCalledWith('1');
    });

    it('should update a species', async () => {
        const dto = { name: 'Pacu' };
        expect(await controller.update('1', dto)).toEqual({ id: '1', name: 'Pacu' });
        expect(service.update).toHaveBeenCalledWith('1', dto);
    });

    it('should delete a species', async () => {
        expect(await controller.remove('1')).toEqual({ id: '1', name: 'Tambaqui' });
        expect(service.remove).toHaveBeenCalledWith('1');
    });
});
