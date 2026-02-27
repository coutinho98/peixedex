import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Plan } from '@prisma/client';
import { PLAN_KEY } from '../decorator/plan.decorator';

@Injectable()
export class PlanGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPlan = this.reflector.get<Plan>(PLAN_KEY, context.getHandler());
    
    if (!requiredPlan) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (requiredPlan === Plan.PREMIUM && user.plan !== Plan.PREMIUM) {
      throw new ForbiddenException('Esta funcionalidade requer uma assinatura PREMIUM.');
    }

    return true;
  }
}