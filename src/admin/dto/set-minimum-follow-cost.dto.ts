// src/admin/dto/set-minimum-follow-cost.dto.ts

import { IsNotEmpty, IsNumber } from 'class-validator';

export class SetMinimumFollowCostDTO {
  @IsNotEmpty()
  @IsNumber()
  minimumCost: number;
}
