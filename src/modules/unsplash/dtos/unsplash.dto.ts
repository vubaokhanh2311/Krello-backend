import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaginationDto } from '../../../common/dtos/pagination.dto';

export class UnsplashQueryDto extends PaginationDto {
  @ApiProperty({
    example: 'landscape',
    description: 'Từ khoá tìm kiếm ảnh trên Unsplash',
  })
  @IsString()
  @IsNotEmpty()
  query: string;
}
