import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNotEmpty } from 'class-validator';
import { PaginationDto } from '../../../common/dtos/pagination.dto';

export class LabelQueryDto extends PaginationDto {
  @ApiPropertyOptional({
    example: 'Urgent',
    description: 'Filter labels by name (case-insensitive)',
  })
  @IsOptional()
  @IsString()
  name: string;

  @ApiPropertyOptional({
    example: '#FF5733',
    description: 'Filter labels by color (hex format or name)',
  })
  @IsOptional()
  @IsString()
  color: string;
}

export class CreateLabelDto {
  @ApiProperty({
    example: 'Urgent',
    description: 'The name of the label',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional({
    example: '#FF5733',
    description: 'The color of the label (hex format or name)',
  })
  @IsOptional()
  @IsString()
  color: string;
}

export class UpdateLabelDto {
  @ApiProperty({
    example: 'In Progress',
    description: 'The updated name of the label',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional({
    example: '#3498DB',
    description: 'The updated color of the label (hex format or name)',
  })
  @IsOptional()
  @IsString()
  color: string;
}
