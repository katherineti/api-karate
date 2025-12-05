import { Body, Controller, Post, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto } from './signIn.dto';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { RoleType } from 'types';
import { Roles } from 'src/decorators/role.decorators';
import { AuthGuard } from '../guards/auth.guard';
import { RolesGuard } from '../guards/roles.guard';

@Controller('auth')
export class AuthController {

    constructor( private authService: AuthService ){}

    @HttpCode(HttpStatus.OK)
    @Post('login')
    signIn( @Body() signInDto: SignInDto ): Promise<{ access_token: string }>{
        return this.authService.signIn(
            signInDto.email,
            signInDto.password
        );
    }

    @Post('signUp')
    signUp( @Body() createUser: CreateUserDto ) {
        return this.authService.signUp(createUser);
    } 

    // 2. NUEVA RUTA PROTEGIDA PARA CREAR USUARIOS
    @Post('create-user-protected')
    // A. Protege la ruta con el token de acceso (AuthGuard)
    @UseGuards(AuthGuard, RolesGuard)
    // B. Requiere que el usuario tenga el rol 'Admin'
    @Roles(RoleType.Admin) 
    createByAdmin( @Body() createUser: CreateUserDto ) {
        // La lógica sigue siendo la misma, pero ahora solo un Admin puede llegar aquí.
        return this.authService.signUp(createUser);
    }

    @Post('update')
    @Roles(RoleType.Admin)
    // update( @Body() createUser: CreateUserDto, @Param('id') id: number ) {
    update( @Body() createUser: any) {//le agregue el id
        return this.authService.updateUser(createUser);
    } 

    @Post('delete')
    @Roles(RoleType.Admin)
    delete( @Body() user: {id:number} ) {console.log("controlador eliminar ")
        return this.authService.deleteUser(user.id);
    } 
}