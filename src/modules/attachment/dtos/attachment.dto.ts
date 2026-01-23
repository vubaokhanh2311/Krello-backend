import { IsOptional, IsString, IsNotEmpty } from 'class-validator';
import { PaginationDto } from '../../../common/dtos/pagination.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAttachmentDto {
  @ApiProperty({
    description: 'Name of the file',
    example: 'project-specifications.pdf',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  fileName: string;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Attachment file (binary)',
  })
  @IsOptional()
  @IsString()
  fileUrl: string;
}

export class UpdateAttachmentDto {
  @ApiProperty({
    description: 'Name of the file',
    example: 'updated-specifications.pdf',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  fileName?: string;
}

export class AttachmentQueryDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Filter attachments by file name',
    example: 'project-specifications.pdf',
  })
  @IsOptional()
  @IsString()
  fileName?: string;

  @ApiPropertyOptional({
    description: 'Filter attachments by uploader',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsString()
  uploadedBy?: string;
}
