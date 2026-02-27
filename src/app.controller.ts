import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthGuard } from '@nestjs/passport';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}

@Controller('fishes')
export class FishController {

  @UseGuards(AuthGuard('jwt'))
  @Get('secret')
  getSecretFishes(@Request() req) {
    return {
      message: 'Acesso liberado aos peixes raros!',
      user: req.user,
    };
  }
}