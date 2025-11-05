import { IsString, IsNotEmpty } from 'class-validator';
export class CreateCardLabelDto {
  @IsString()
  @IsNotEmpty()
  labelId: string;
}
