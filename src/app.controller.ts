import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
 
@Controller()
export class AppController {

  constructor(private readonly appService: AppService) { }

  @Get()
  async getHello(): Promise<string> {
    const users = await this.appService.getUsers();
    return 'API SVRAM está funcionando correctamente. Usuarios encontrados: ' + JSON.stringify(users, null, 2);
  }
}