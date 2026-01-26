import { Controller, Get, Post, Body } from '@nestjs/common';
import { ModalitiesService } from './modalities.service';
import { CreateModalityDto } from './dto/create-modality.dto';
import { Public } from '../decorators/public.decorator';

@Controller('modalities')
export class ModalitiesController {
  constructor(private readonly modalitiesService: ModalitiesService) {}

  @Public()
  @Post()
  create(@Body() createModalityDto: CreateModalityDto) {
    return this.modalitiesService.create(createModalityDto);
  }

  @Public()
  @Get()
  findAll() {
    return this.modalitiesService.findAll();
  }
}