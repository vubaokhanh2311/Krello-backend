import {
  IsOptional,
  IsString,
  IsNumber,
  IsDate,
  IsNotEmpty,
} from 'class-validator';
import { PaginationDto } from '../../../common/dtos/pagination.dto';
import { Type } from 'class-transformer';
export class CreateCardDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  position: number;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  dueDate?: Date;

  @IsOptional()
  @IsString()
  createdBy?: string;
}

export class UpdateCardDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  position: number;

  @IsDate()
  @IsOptional()
  dueDate?: Date;

  @IsOptional()
  @IsString()
  createdBy?: string;
}

export class CardQueryDto extends PaginationDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  position?: number;

  @IsDate()
  @IsOptional()
  dueDate?: Date;
}
