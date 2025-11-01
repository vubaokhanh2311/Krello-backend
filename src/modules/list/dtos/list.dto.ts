import { IsNotEmpty, IsOptional, IsString, IsNumber } from 'class-validator';
import { PaginationDto } from '../../../common/dtos/pagination.dto';

export class CreateListDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsNumber()
  position: number;
}

export class UpdateListDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsNumber()
  position: number;
}

export class ListQueryDto extends PaginationDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsNumber()
  position?: number;
}
