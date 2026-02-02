import { Controller, Post, Body, UsePipes, ValidationPipe, Delete, Param, ParseIntPipe } from '@nestjs/common';
import { KarateBeltsService } from './karate-belts.service';
import { Public } from '../decorators/public.decorator';
import { PaginationKarateBeltsDto } from './dto/pagination-karate-belts.dto';

@Controller('karate-belts')
export class KarateBeltsController {
  constructor(private readonly karateBeltsService: KarateBeltsService) {}

  @Public()
  @Post('list') // Usamos POST /list para coherencia con el módulo de escuelas
  @UsePipes(new ValidationPipe({ 
    transform: true, 
    transformOptions: { enableImplicitConversion: true } 
  }))
  findAll(@Body() paginationDto: PaginationKarateBeltsDto) {
    return this.karateBeltsService.findAllPaginated(paginationDto);
  }

  //DELETE http://localhost:3000/karate-belts/5
  @Public()
  @Delete(':id') 
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.karateBeltsService.remove(id);
  }
}