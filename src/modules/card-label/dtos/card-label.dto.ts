import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCardLabelDto {
  @ApiProperty({
    description: 'ID of the user to be added as a label of the card',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty()
  labelId: string;
}
