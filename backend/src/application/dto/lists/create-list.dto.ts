import { IsString, MinLength, MaxLength, IsOptional } from 'class-validator';

export class CreateListDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  title!: string;

  @IsString()
  @MaxLength(500)
  @IsOptional()
  description?: string;
}
