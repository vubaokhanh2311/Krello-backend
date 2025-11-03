import { IsString, IsNotEmpty } from 'class-validator';
export class CreateCardMenberDto {
  @IsString()
  @IsNotEmpty()
  userId: string;
}
