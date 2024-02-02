// src/investor/dto/trade-shares.dto.ts

import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class TradeSharesDTO {
  @IsNotEmpty()
  @IsString()
  action: string;

  @IsNotEmpty()
  @IsString()
  shareId: string;

  @IsNotEmpty()
  @IsNumber()
  price: number;
}
