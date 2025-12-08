import { Body, Controller, Post, HttpCode, HttpStatus, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto } from './signIn.dto';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { RoleType } from 'types';
import { Roles } from 'src/decorators/role.decorators';
import { AuthGuard } from '../guards/auth.guard';
import { SignupDto } from './signup.dto';

@Controller('auth')
export class AuthController {

    constructor( private authService: AuthService ){}

    @HttpCode(HttpStatus.OK)
    @Post('login')
    @UsePipes(ValidationPipe)
    signIn( @Body() signInDto: SignInDto ): Promise<{ access_token: string }>{
        return this.authService.signIn(
            signInDto.email,
            signInDto.password
        );
    }

    @Post('signUp')
    @UsePipes(ValidationPipe)
    signUp( @Body() createUser: SignupDto ) {
        return this.authService.signUp(createUser);
    } 

    // Protege la ruta con el token de acceso (AuthGuard)
    @Post('create-user-protected')
    @UseGuards(AuthGuard)
    createByAdmin( @Body() createUser: SignupDto ) {
        return this.authService.signUp(createUser);
    }

    //el juez no edita ni elimina
    @Post('update')
    @UseGuards(AuthGuard)
    @Roles(RoleType.Admin, RoleType.Master)
    // update( @Body() createUser: CreateUserDto, @Param('id') id: number ) {
    update( @Body() createUser: any) {
        return this.authService.updateUser(createUser);
    }
}