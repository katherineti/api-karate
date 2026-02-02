import { Controller, Post, Body, UsePipes, ValidationPipe, Delete, Param, ParseIntPipe, Patch, Get } from '@nestjs/common';
import { KarateBeltsService } from './karate-belts.service';
import { Public } from '../decorators/public.decorator';
import { PaginationKarateBeltsDto } from './dto/pagination-karate-belts.dto';
import { CreateKarateBeltDto } from './dto/create-karate-belt.dto';
import { UpdateKarateBeltDto } from './dto/update-karate-belt.dto';

@Controller('karate-belts')
export class KarateBeltsController {
  constructor(private readonly karateBeltsService: KarateBeltsService) {}

/*  POST http://localhost:3000/karate-belts/list
Body: {
  "page": 1,
  "limit": 10
} */
  @Public()
  @Post('list') // Usamos POST /list para coherencia con el módulo de escuelas
  @UsePipes(new ValidationPipe({ 
    transform: true, 
    transformOptions: { enableImplicitConversion: true } 
  }))
  findAllPaginated(@Body() paginationDto: PaginationKarateBeltsDto) {
    return this.karateBeltsService.findAllPaginated(paginationDto);
  }

    @Public()
    @Get()
    findAll() {
    return this.karateBeltsService.findAll();
  }

  //Para Crear:  POST http://localhost:3000/karate-belts
  //Para Crear:  POST https://api-karate.onrender.com/karate-belts
  //body: { "belt": "Naranja", "grade": "1º Kyu", "rank_order": 3 }
  @Public()
  @Post()
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  create(@Body() createKarateBeltDto: CreateKarateBeltDto) {
    return this.karateBeltsService.create(createKarateBeltDto);
  }

  //Para Editar:  PATCH http://localhost:3000/karate-belts/3
  //Para Editar:  PATCH https://api-karate.onrender.com/karate-belts/3
  //body { "belt": "Naranja Intenso", "grade": "1º Kyu", "rank_order": 3 }
  @Public()
  @Patch(':id')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  update(
    @Param('id', ParseIntPipe) id: number, 
    @Body() updateKarateBeltDto: UpdateKarateBeltDto
  ) {
    return this.karateBeltsService.update(id, updateKarateBeltDto);
  }

  //DELETE http://localhost:3000/karate-belts/5
  @Public()
  @Delete(':id') 
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.karateBeltsService.remove(id);
  }
}