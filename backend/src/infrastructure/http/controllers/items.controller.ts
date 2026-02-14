import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CreateItemUseCase } from '../../../application/use-cases/items/create-item.use-case';
import { GetListItemsUseCase } from '../../../application/use-cases/items/get-list-items.use-case';
import { UpdateItemUseCase } from '../../../application/use-cases/items/update-item.use-case';
import { DeleteItemUseCase } from '../../../application/use-cases/items/delete-item.use-case';
import { CreateItemDto } from '../../../application/dto/items/create-item.dto';
import { UpdateItemDto } from '../../../application/dto/items/update-item.dto';
import type { RequestWithUser } from '../types/request-with-user.interface';

@Controller('lists/:listId/items')
@UseGuards(JwtAuthGuard)
export class ItemsController {
  constructor(
    private readonly createItemUseCase: CreateItemUseCase,
    private readonly getListItemsUseCase: GetListItemsUseCase,
    private readonly updateItemUseCase: UpdateItemUseCase,
    private readonly deleteItemUseCase: DeleteItemUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createItem(
    @Param('listId') listId: string,
    @Body() dto: CreateItemDto,
    @Request() req: RequestWithUser,
  ) {
    const userId = req.user.id;
    return await this.createItemUseCase.execute(listId, dto, userId);
  }

  @Get()
  async getListItems(
    @Param('listId') listId: string,
    @Request() req: RequestWithUser,
  ) {
    const userId = req.user.id;
    return await this.getListItemsUseCase.execute(listId, userId);
  }

  @Patch(':id')
  async updateItem(
    @Param('id') itemId: string,
    @Body() dto: UpdateItemDto,
    @Request() req: RequestWithUser,
  ) {
    const userId = req.user.id;
    return await this.updateItemUseCase.execute(itemId, dto, userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteItem(
    @Param('id') itemId: string,
    @Request() req: RequestWithUser,
  ) {
    const userId = req.user.id;
    await this.deleteItemUseCase.execute(itemId, userId);
  }
}
