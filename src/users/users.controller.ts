import { Controller, Get, Query, UsePipes, ValidationPipe, UseGuards, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { AuthGuard } from '../guards/auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from 'src/decorators/role.decorators'; 
import { RoleType } from 'types'; 

@Controller('users')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class UsersController {
  
  constructor(private readonly usersService: UsersService) {}
  // A. Usar AuthGuard: Verifica que haya un token JWT válido.
  // B. Usar RolesGuard: Verifica que el rol en el token esté permitido.

  // 1. 🔒 Endpoint de LISTA PAGINADA PROTEGIDA (GET /users?page=1&limit=5)
  @Get()
  @UseGuards(AuthGuard, RolesGuard) 
  @Roles(RoleType.Admin, RoleType.Master, RoleType.Juez) 
  
  async getPaginatedList(@Query() query: PaginationDto) {
    return this.usersService.getPaginatedUsers(
      query.page, 
      query.limit, 
      query.search,  
      query.roleName 
    );
  }

// 2. 🔒 Endpoint de DETALLE DE USUARIO (GET /users/:id)
  @Get(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RoleType.Admin, RoleType.Master, RoleType.Juez) 
  async getUserDetail(@Param('id') id: string) {
    const userId = parseInt(id, 10);
    
    // 💡 Llamada actualizada al método renombrado
    return this.usersService.findUserDetailById(userId);
  }
}