import { Controller, Get, Post, Body } from '@nestjs/common';
import { ModalitiesService } from './modalities.service';
import { CreateModalityDto } from './dto/create-modality.dto';
import { UpdateModalityDto } from './dto/update-modality.dto';

@Controller('modalities')
export class ModalitiesController {
  constructor(private readonly modalitiesService: ModalitiesService) {}

  @Post()
  create(@Body() createModalityDto: CreateModalityDto) {
    return this.modalitiesService.create(createModalityDto);
  }

  @Get()
  findAll() {
    return this.modalitiesService.findAll();
  }
}