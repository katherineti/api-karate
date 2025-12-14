import { Controller, Get, Query, UsePipes, ValidationPipe, UseGuards, Param, Body, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { AuthGuard } from '../guards/auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from 'src/decorators/role.decorators'; 
import { RoleType } from 'types'; 
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class UsersController {
  
  constructor(private readonly usersService: UsersService) {}
  // A. Usar AuthGuard: Verifica que haya un token JWT válido.
  // B. Usar RolesGuard: Verifica que el rol en el token esté permitido.

  // 1. Endpoint de LISTA PAGINADA PROTEGIDA (GET /users?page=1&limit=5)
  @Get()
  @UsePipes(ValidationPipe)
  @UseGuards(AuthGuard, RolesGuard) 
  @Roles(RoleType.Admin, RoleType.Master, RoleType.Juez) 
  async getPaginatedList(@Query() query: PaginationDto) {
    return this.usersService.getPaginatedUsers(
      query.page, 
      query.limit, 
      query.search,  
      query.roleFilter
    );
  }

// 2. Endpoint del modal DETALLE DE USUARIO (GET /users/:id) y para cargar el usuario seleccionado en el modal de EDITAR USUARIO 
  @Get(':id')
  @UseGuards(AuthGuard)
  // @Roles(RoleType.Admin, RoleType.Master, RoleType.Juez) 
  async getUserDetail(@Param('id') id: string) {
    const userId = parseInt(id, 10);
    // Llamada actualizada al método renombrado
    return this.usersService.findUserDetailById(userId);
  }

  @Get('by-role/:roleId')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RoleType.Admin, RoleType.Master, RoleType.Juez) 
  async getUsersByRole(@Param('roleId') roleId: number) {
    return this.usersService.getByRol(roleId);
  }

  //el juez no edita ni elimina
  @Post('update')
  @UsePipes(ValidationPipe)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RoleType.Admin, RoleType.Master)
  update( @Body() user: UpdateUserDto) {
      return this.usersService.updateUser(user);
  }

  @Post('change-status')
  @UsePipes(ValidationPipe)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RoleType.Admin, RoleType.Master)
  changeStatus( @Body() user: UpdateUserDto) {
      return this.usersService.changeStatus(user);
  }

}