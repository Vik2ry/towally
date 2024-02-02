// src/investor/dto/trade-currency.dto.ts

import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class TradeCurrencyDTO {
  @IsNotEmpty()
  @IsString()
  action: string;

  @IsNotEmpty()
  @IsNumber()
  amount: number;
}
