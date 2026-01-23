import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class PaginationDto {
  @ApiPropertyOptional({
    example: 1,
    description: 'Page number (starts from 1)',
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({
    example: 10,
    description: 'Number of items per page',
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize: number = 10;

  @ApiPropertyOptional({
    example: 'createdAt:desc',
    description: 'Sort order (format: field:asc or field:desc)',
  })
  @IsOptional()
  @IsString()
  order?: string;

  @ApiPropertyOptional({
    example: 'id,name,email',
    description: 'Comma-separated list of fields to include in response',
  })
  @IsOptional()
  @IsString()
  fields?: string;
}
