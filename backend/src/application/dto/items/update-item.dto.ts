import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  MinLength,
  MaxLength,
  Min,
} from 'class-validator';
import { ItemStatus, ItemPriority } from '../../../domain/entities/item.entity';

export class UpdateItemDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  @IsOptional()
  name?: string;

  @IsNumber()
  @Min(0.01)
  @IsOptional()
  quantity?: number;

  @IsString()
  @MaxLength(20)
  @IsOptional()
  unit?: string;

  @IsEnum(ItemStatus)
  @IsOptional()
  status?: ItemStatus;

  @IsEnum(ItemPriority)
  @IsOptional()
  priority?: ItemPriority;
}
