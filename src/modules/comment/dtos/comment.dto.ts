import { IsOptional, IsString, IsNotEmpty } from 'class-validator';
import { PaginationDto } from '../../../common/dtos/pagination.dto';

export class CommentQueryDto extends PaginationDto {
  @IsOptional()
  @IsString()
  content: string;
}

export class CreateCommentDto {
  @IsNotEmpty()
  @IsString()
  content: string;
}

export class UpdateCommentDto {
  @IsNotEmpty()
  @IsString()
  content: string;
}
