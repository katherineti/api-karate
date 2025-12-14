import { ConflictException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { NeonDatabase } from 'drizzle-orm/neon-serverless';
import { JWTSecret, PG_CONNECTION } from 'src/constants';
import { UsersService } from 'src/users/users.service';
import * as argon2 from "argon2";
import { JwtService } from '@nestjs/jwt';
import { SignupDto } from './signup.dto';

@Injectable()
export class AuthService {

     constructor(
        @Inject(PG_CONNECTION) private db: NeonDatabase,
        private usersService: UsersService,
        private jwtService: JwtService
    ) {}

    async signIn(email:string, password: string): Promise<{ access_token: string }> {
        
        const user = await this.usersService.findOnByEmail(email);

        if(!user){
            throw new UnauthorizedException("Usuario no encontrado"); 
        }

        const authorized = await argon2.verify( user.password , password ); //devuelve true o false

        if( !authorized ){
            throw new UnauthorizedException("Contraseña incorrecta");
        }

        const payload = { 
          sub: user.id, 
          name: user.name,
          lastname: user.lastname,
          email: user.email,
          // roles_ids: user.roles_ids,
          roles: (user.roles_ids.length > 0) ? user.roles : null,
          school_id: user.school_id,
        };
        console.log("JWTSecret " , JWTSecret)
        console.log("payload " , payload)

        return {
          access_token: await this.jwtService.signAsync(payload, {
            secret: JWTSecret
          }),
        };
    }

    async signUp(signUp:SignupDto): Promise<{
      ok: boolean,
      status: number,
      description: string,
    }> {

      const userExist = await this.usersService.findOnByEmail(signUp.email, true);

      if (userExist) {
        throw new ConflictException('El correo ya existe.');
      }
          
      await this.usersService.createUser(signUp);

      const objSaved = {
        ok: true,
        status: 201,
        description: 'Usuario registrado',
      };
  
      return objSaved;
    }
}