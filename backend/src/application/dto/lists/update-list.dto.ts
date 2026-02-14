import { IsString, MinLength, MaxLength, IsOptional } from 'class-validator';

export class UpdateListDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  @IsOptional()
  title?: string;

  @IsString()
  @MaxLength(500)
  @IsOptional()
  description?: string;
}
