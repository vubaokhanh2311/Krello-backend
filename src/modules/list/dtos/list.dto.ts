import { IsNotEmpty, IsOptional, IsString, IsNumber } from 'class-validator';

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
