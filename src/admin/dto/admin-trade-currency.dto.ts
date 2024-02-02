// src/admin/dto/admin-trade-currency.dto.ts

import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class AdminTradeCurrencyDTO {
  @IsNotEmpty()
  @IsString()
  action: string;

  @IsNotEmpty()
  @IsNumber()
  wallys: number;
}
