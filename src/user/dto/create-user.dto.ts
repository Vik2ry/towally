import {
    IsEmail,
    IsEnum,
    IsOptional,
    IsString,
    IsInt,
    IsNotEmpty,
    IsDateString,
    IsArray,
    ArrayNotEmpty,
    IsNumber,
} from 'class-validator';
import { Country, RoleType } from "./enums";

export class CreateUserDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsOptional()
    firstName?: string;

    @IsString()
    @IsOptional()
    lastName?: string;

    @IsString()
    @IsOptional()
    tagline?: string;

    @IsDateString()
    @IsOptional()
    dob?: Date;

    @IsEnum(Country)
    @IsOptional()
    country?: Country;

    @IsInt()
    @IsOptional()
    zipcode?: number;

    @IsString()
    @IsOptional()
    profession?: string;

    @IsString()
    @IsOptional()
    company?: string;

    @IsArray()
    @ArrayNotEmpty()
    @IsOptional()
    links?: string[];

    @IsNumber()
    @IsOptional()
    FollowIncome?: number;

    @IsNumber()
    @IsOptional()
    dataIncome?: number;

    @IsNumber()
    @IsOptional()
    wallyWallet?: number;

    @IsEnum(RoleType)
    @IsOptional()
    roleType?: RoleType;

    @IsNumber()
    @IsOptional()
    adminRevenue?: number;
}
