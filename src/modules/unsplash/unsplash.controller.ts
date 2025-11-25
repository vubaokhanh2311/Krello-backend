import { Controller, Get, Query } from '@nestjs/common';
import { UnsplashService } from './unsplash.service';
import { UnsplashQueryDto } from './dtos/unsplash.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ApiSecurityAuth } from '../../common/decorators/swagger.decorator';

@ApiTags('unsplash')
@ApiSecurityAuth()
@Controller('unsplash')
export class UnsplashController {
  constructor(private readonly unsplashService: UnsplashService) {}

  @Get('search')
  @ApiOperation({ summary: 'Get list of unsplash' })
  async search(
    @Query('query') query: string,
    @Query() pagination: UnsplashQueryDto,
  ) {
    return this.unsplashService.findAll(pagination, query);
  }
}
