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
} from 'class-validator';
import { Country } from "./enums";

export class UpdateUserDto {
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
}