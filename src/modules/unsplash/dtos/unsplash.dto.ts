import {
  IsOptional,
  IsString,
  IsNumber,
  IsDate,
  IsNotEmpty,
} from 'class-validator';
import { PaginationDto } from '../../../common/dtos/pagination.dto';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UnsplashQueryDto extends PaginationDto {}
