import { IsOptional, IsString, IsNotEmpty } from 'class-validator';
import { PaginationDto } from '../../../common/dtos/pagination.dto';

export class CreateAttachmentDto {
  @IsString()
  @IsNotEmpty()
  fileName: string;

  @IsOptional()
  @IsString()
  fileUrl: string;
}

export class UpdateAttachmentDto {
  @IsString()
  @IsNotEmpty()
  fileName: string;
}

export class AttachmentQueryDto extends PaginationDto {
  @IsOptional()
  @IsString()
  fileName?: string;

  @IsOptional()
  @IsString()
  uploadedBy?: string;
}
