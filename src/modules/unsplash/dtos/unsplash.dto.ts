import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaginationDto } from '../../../common/dtos/pagination.dto';

export class UnsplashQueryDto extends PaginationDto {
  @ApiProperty({
    example: 'landscape',
    description: 'Search keyword for Unsplash images',
  })
  @IsString()
  @IsNotEmpty()
  query: string;
}
