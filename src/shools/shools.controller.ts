import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { ShoolsService } from './shools.service';
import { PaginationSchoolsDto } from './dto/pagination-schools.dto';
import { Public } from '../decorators/public.decorator';
import { UpdateSchoolDto } from './dto/update-school.dto';
import { CreateSchoolDto } from './dto/create-school.dto';
import { ChangeStatusSchoolDto } from './dto/change-status-school.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadedFile, UseInterceptors } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname } from 'path';
@Controller('shools')
export class ShoolsController {

    constructor(private readonly shoolsService: ShoolsService) {}
    
    @Get()//protegido
    // @UseGuards(AuthGuard)
    async getAll() {
    return this.shoolsService.getAll();
    }

    @Public()
    @Get(':id')//sin usar
    async getById(@Param('id', ParseIntPipe) id: number) {
      // La validación ocurre dentro del servicio
      return await this.shoolsService.getById(id);
    }

@Public()
  @Post()
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: './uploads', // Carpeta donde se guardará físicamente
      filename: (req, file, callback) => {
        // Creamos un nombre único: nombreOriginal-numeroAleatorio.extension
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = extname(file.originalname);
        callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
      },
    }),
  }))
  @UsePipes(new ValidationPipe({ 
    transform: true, 
    whitelist: true,
    transformOptions: { enableImplicitConversion: true } 
  }))
  async create(
    @Body() createSchoolDto: CreateSchoolDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    // Ahora 'file.path' contiene la ruta real donde se guardó el archivo
    const logoUrl = file ? file.path.replaceAll('\\', '/') : null;    
    return this.shoolsService.create({ 
      ...createSchoolDto, 
      logo_url: logoUrl 
    });
  }

    @Public()
    @Post('list') // Cambiamos a POST para recibir el Body
    @UsePipes(new ValidationPipe({ transform: true, transformOptions: { enableImplicitConversion: true } }))
    async getSchools(@Body() paginationDto: PaginationSchoolsDto) {
        return this.shoolsService.findAllPaginated(paginationDto);
    }

    @Public()
    @Patch(':id')
    @UseInterceptors(FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
    }))
    @UsePipes(new ValidationPipe({ 
      transform: true, 
      whitelist: true,
      transformOptions: { enableImplicitConversion: true } 
    }))
    async update(
      @Param('id', ParseIntPipe) id: number,
      @Body() updateSchoolDto: UpdateSchoolDto,
      @UploadedFile() file?: Express.Multer.File,
    ) {
      const logoUrl = file ? file.path.replaceAll('\\', '/') : undefined;

      // Pasamos el DTO y el logoUrl (si existe) al servicio
      return this.shoolsService.update(id, { 
        ...updateSchoolDto, 
        ...(logoUrl && { logo_url: logoUrl }) 
      });
    }

  // Endpoint para Habilitar/Inhabilitar (un solo controlador)
    @Public()
    @Patch(':id/status')
    async changeStatus(
      @Param('id', ParseIntPipe) id: number,
      @Body() changeStatusDto: ChangeStatusSchoolDto,
    ) {
      return this.shoolsService.changeStatus(id, changeStatusDto.isActive);
    }

  // Endpoint para Borrado Físico
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.shoolsService.remove(id);
  }

}