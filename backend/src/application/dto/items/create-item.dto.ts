import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  MinLength,
  MaxLength,
  Min,
} from 'class-validator';
import { ItemPriority } from '../../../domain/entities/item.entity';

export class CreateItemDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name!: string;

  @IsNumber()
  @Min(0.01)
  quantity!: number;

  @IsString()
  @MaxLength(20)
  @IsOptional()
  unit?: string;

  @IsEnum(ItemPriority)
  @IsOptional()
  priority?: ItemPriority;
}
