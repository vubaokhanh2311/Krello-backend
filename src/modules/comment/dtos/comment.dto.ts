import { IsOptional, IsString, IsNotEmpty } from 'class-validator';
import { PaginationDto } from '../../../common/dtos/pagination.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CommentQueryDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Filter comments by content',
    example: 'This is a comment',
  })
  @IsOptional()
  @IsString()
  content: string;
}

export class CreateCommentDto {
  @ApiProperty({
    description: 'Content of the comment',
    example: 'This is a comment',
  })
  @IsNotEmpty()
  @IsString()
  content: string;
}

export class UpdateCommentDto {
  @ApiProperty({
    description: 'Content of the comment',
    example: 'Updated comment content',
  })
  @IsNotEmpty()
  @IsString()
  content: string;
}
