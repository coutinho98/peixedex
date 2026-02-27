import { SetMetadata } from '@nestjs/common';
import { Plan } from '@prisma/client';

export const PLAN_KEY = 'plan';
export const RequirePlan = (plan: Plan) => SetMetadata(PLAN_KEY, plan);