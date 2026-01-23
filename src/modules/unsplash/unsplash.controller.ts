import { Controller, Get, Query } from '@nestjs/common';
import { UnsplashService } from './unsplash.service';
import { UnsplashQueryDto } from './dtos/unsplash.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ApiSecurityAuth } from '../../common/decorators/swagger.decorator';

@ApiTags('unsplash')
@ApiSecurityAuth()
@Controller('unsplash')
export class UnsplashController {
  constructor(private readonly unsplashService: UnsplashService) {}

  @Get('search')
  @ApiOperation({
    summary: 'Search Unsplash images',
    description:
      'Search for images on Unsplash using a keyword. Results can be used as board backgrounds. Supports pagination.',
  })
  @ApiResponse({ status: 200, description: 'Successfully retrieved images' })
  @ApiResponse({ status: 400, description: 'Invalid search query' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or expired token',
  })
  async search(
    @Query('query') query: string,
    @Query() pagination: UnsplashQueryDto,
  ) {
    return this.unsplashService.findAll(pagination, query);
  }
}
