import { Controller, Get, Query, UsePipes, ValidationPipe, UseGuards, Param, Body, Post, ParseIntPipe } from '@nestjs/common';
import { UsersService } from './users.service';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { AuthGuard } from '../guards/auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from 'src/decorators/role.decorators'; 
import { RoleType } from 'types'; 
import { UpdateUserDto } from './dto/update-user.dto';
import { Public } from '../decorators/public.decorator';

@Controller('users')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class UsersController {
  
  constructor(private readonly usersService: UsersService) {}
  // A. Usar AuthGuard: Verifica que haya un token JWT válido.
  // B. Usar RolesGuard: Verifica que el rol en el token esté permitido.

  // 1. Endpoint de LISTA PAGINADA PROTEGIDA (GET /users?page=1&limit=5)
  @Public()
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
  @Get(':id') //protegido
  // @UseGuards(AuthGuard)
  // @Roles(RoleType.Admin, RoleType.Master, RoleType.Juez) 
  async getUserDetail(@Param('id') id: string) {
    const userId = parseInt(id, 10);
    // Llamada actualizada al método renombrado
    return this.usersService.findUserDetailById(userId);
  }

  @Public()
  @Get('by-role/:roleId')//lista representantes en el form de editar usuario
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RoleType.Admin, RoleType.Master, RoleType.Juez, RoleType.Alumno) 
  async getUsersByRole(@Param('roleId') roleId: number) {
    return this.usersService.getByRol(roleId);
  }

  //el juez no edita ni elimina
  @Post('update') //protegido
  @UsePipes(ValidationPipe)
  // @UseGuards(AuthGuard)
  // @Roles(RoleType.Admin, RoleType.Master)
  update( @Body() user: UpdateUserDto) {console.log("user",user)
      return this.usersService.updateUser(user);
  }

  @Public()
  @Post('change-status')
  @UsePipes(ValidationPipe)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RoleType.Admin, RoleType.Master)
  changeStatus( @Body() user: UpdateUserDto) {
      return this.usersService.changeStatus(user);
  }

  @Public()
  @Get('alumnos/escuela/:schoolId')
  // @UseGuards(AuthGuard, RolesGuard)
  // @Roles(RoleType.Admin, RoleType.Master) // Solo Admin o Master pueden ver esta lista
  async getAlumnosByEscuela(@Param('schoolId', ParseIntPipe) schoolId: number) {
    return this.usersService.getAlumnosByEscuela(schoolId);
  }

}