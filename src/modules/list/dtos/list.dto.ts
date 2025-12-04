import { IsNotEmpty, IsOptional, IsString, IsNumber } from 'class-validator';
import { PaginationDto } from '../../../common/dtos/pagination.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateListDto {
  @ApiProperty({
    example: 'Urgent',
    description: 'The title of the list',
  })
  @IsNotEmpty()
  @IsString()
  title: string;
}

export class UpdateListDto {
  @ApiProperty({
    example: 'Urgent',
    description: 'The title of the list',
  })
  @IsNotEmpty()
  @IsString()
  title: string;
}

export class ListQueryDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Filter lists by title',
    example: 'Urgent',
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({
    description: 'Filter lists by position',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  position?: number;
}
