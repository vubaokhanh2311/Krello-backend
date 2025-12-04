import {
  IsOptional,
  IsString,
  IsNumber,
  IsDate,
  IsArray,
  IsNotEmpty,
} from 'class-validator';
import { PaginationDto } from '../../../common/dtos/pagination.dto';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCardDto {
  @ApiProperty({
    description: 'Title of the card',
    example: 'Finish NestJS project',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({
    description: 'Description of the card',
    example: 'Implement all CRUD operations',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Position of the card in the list',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  position: number;

  @ApiPropertyOptional({
    description: 'Due date of the card',
    example: '2025-12-31T23:59:59.000Z',
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  dueDate?: Date;

  @ApiPropertyOptional({
    description: 'User who created the card',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsString()
  createdBy?: string;
}
export class UpdateCardDto {
  @ApiProperty({
    description: 'Title of the card',
    example: 'Finish NestJS project',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({
    description: 'Description of the card',
    example: 'Implement all CRUD operations',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Position of the card in the list',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  position: number;

  @ApiPropertyOptional({
    description: 'Due date of the card',
    example: '2025-12-31T23:59:59.000Z',
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  dueDate?: Date;

  @ApiPropertyOptional({
    description: 'User who created the card',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsString()
  createdBy?: string;

  @ApiPropertyOptional({
    description: 'List ID to move the card to',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsString()
  listId?: string;

  // 🔥 ADD THIS — REQUIRED FOR ORDERING
  @ApiPropertyOptional({
    description: 'New order of card IDs inside the list',
    example: ['cardA', 'cardB', 'cardC'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  taskOrder?: string[];
}

export class CardQueryDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Filter cards by title',
    example: 'Finish NestJS project',
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({
    description: 'Filter cards by description',
    example: 'Implement all CRUD operations',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Filter cards by position',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  position?: number;

  @ApiPropertyOptional({
    description: 'Filter cards by due date',
    example: '2025-12-31T23:59:59.000Z',
  })
  @IsOptional()
  @IsDate()
  dueDate?: Date;
}
