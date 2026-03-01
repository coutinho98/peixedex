import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

// agrupa os testes relacionaods. é igual uma pasta onde você coloca os testes relacionados
describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;

  // serve para mockar os dados e evitar de fazer chamadas reais ao banco de dados durante os testes
  // jest .fn() cria uma função dubLê de rico. ela não faz nada, mas o jest consegue monitorar se foi chamada
  // com quais argumentos e permite que você simule o que ela deve retornar (ex: simular que achou um usuário ou que o banco deu erro). 
  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
  };

  // beforeEach roda antes de cada teste individual. é útil para configurar o ambiente de teste, criar instâncias e garantir que cada teste comece com um estado limpo
  // Test.createTestingModule cria um módulo nestjs temp
  // providers injeta o authservice real, mas usamos  o useValue para trocar o PrismaService real pelo nosso mockPrismaService false.
  // module.get extrai as instâncias criadas para que possamos usa-las dentro dos testes
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService }, // Trocamos o real pelo falso
        {
          provide: JwtService,
          useValue: { signAsync: jest.fn().mockResolvedValue('fake_token') },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  // it define um caso de teste especifico (lê-se: "isso deve...")
  // expect(....).toBBeDefined() é uma afirmação (assertion) o teste só passa se o service tiver sido criado corretamente pelo nest
  it('deve lançar UnauthorizedException se o usuário não for encontrado', async () => {
    jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);
    const dto = { email: 'inexistente@teste.com', password: '123' };
    await expect(service.signIn(dto)).rejects.toThrow('Invalid credentials');
  });

  it('deve retornar um access_token quando as credenciais estiverem corretas', async () => {
    const password = 'hashed_password';

    jest.spyOn(prisma.user, 'findUnique').mockResolvedValue({
      id: '1',
      email: 'mateus@teste.com',
      password: password,
      role: 'USER',
      plan: 'FREEMIUM',
    } as any);

    const bcrypt = require('bcrypt');
    jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(true));

    const dto = { email: 'mateus@teste.com', password: '123' };
    const result = await service.signIn(dto);

    expect(result).toHaveProperty('access_token');
    expect(result).toHaveProperty('refresh_token');
    expect(result.access_token).toBe('fake_token');
  });
});