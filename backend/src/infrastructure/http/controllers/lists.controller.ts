import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CreateListUseCase } from '../../../application/use-cases/lists/create-list.use-case';
import { GetUserListsUseCase } from '../../../application/use-cases/lists/get-user-lists.use-case';
import { DeleteListUseCase } from '../../../application/use-cases/lists/delete-list.use-case';
import { AddMemberUseCase } from '../../../application/use-cases/lists/add-member.use-case';
import { CreateListDto } from '../../../application/dto/lists/create-list.dto';
import { AddMemberDto } from '../../../application/dto/lists/add-member.dto';
import type { RequestWithUser } from '../types/request-with-user.interface';

@Controller('lists')
@UseGuards(JwtAuthGuard)
export class ListsController {
  constructor(
    private readonly createListUseCase: CreateListUseCase,
    private readonly getUserListsUseCase: GetUserListsUseCase,
    private readonly deleteListUseCase: DeleteListUseCase,
    private readonly addMemberUseCase: AddMemberUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createList(
    @Body() dto: CreateListDto,
    @Request() req: RequestWithUser,
  ) {
    const userId = req.user.id;
    return await this.createListUseCase.execute(dto, userId);
  }

  @Get()
  async getUserLists(@Request() req: RequestWithUser) {
    const userId = req.user.id;
    return await this.getUserListsUseCase.execute(userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteList(
    @Param('id') listId: string,
    @Request() req: RequestWithUser,
  ) {
    const userId = req.user.id;
    await this.deleteListUseCase.execute(listId, userId);
  }

  @Post(':id/members')
  @HttpCode(HttpStatus.CREATED)
  async addMember(
    @Param('id') listId: string,
    @Body() dto: AddMemberDto,
    @Request() req: RequestWithUser,
  ) {
    const userId = req.user.id;
    return await this.addMemberUseCase.execute(listId, dto, userId);
  }
}
