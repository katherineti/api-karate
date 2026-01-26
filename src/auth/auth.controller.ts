import { Body, Controller, Post, HttpCode, HttpStatus, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/signIn.dto';
import { AuthGuard } from '../guards/auth.guard';
import { SignupDto } from './dto/signup.dto';
import { Public } from '../decorators/public.decorator';

@Controller('auth')
export class AuthController {

    constructor( private authService: AuthService ){}

    @Public()
    @HttpCode(HttpStatus.OK)
    @Post('login')
    @UsePipes(ValidationPipe)
    signIn( @Body() signInDto: SignInDto ): Promise<{ access_token: string }>{
        return this.authService.signIn(
            signInDto.email,
            signInDto.password
        );
    }

    @Public()
    @Post('signUp')
    @UsePipes(ValidationPipe)
    signUp( @Body() createUser: SignupDto ) {
        return this.authService.signUp(createUser);
    } 

    // Protege la ruta con el token de acceso (AuthGuard)
    @Post('create-user-protected')
    @UsePipes(ValidationPipe)
    // @UseGuards(AuthGuard)
    createByAdmin( @Body() createUser: SignupDto ) {
        return this.authService.signUp(createUser);
    }

}