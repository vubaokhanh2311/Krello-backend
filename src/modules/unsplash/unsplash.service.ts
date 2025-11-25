import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { UnsplashQueryDto } from './dtos/unsplash.dto';
import { getPagination, buildMeta } from '../../common/utils/index';
import { ERROR_MESSAGES } from 'src/constants';
@Injectable()
export class UnsplashService {
  private accessKey = process.env.UNSPLASH_ACCESS_KEY;

  constructor(private readonly httpService: HttpService) {}

  async findAll(query: UnsplashQueryDto, searchQuery: string) {
    const { page, pageSize } = getPagination(query);

    try {
      const url = 'https://api.unsplash.com/search/photos';

      const response = await lastValueFrom(
        this.httpService.get(url, {
          params: {
            query: searchQuery,
            page,
            per_page: pageSize,
            client_id: this.accessKey,
          },
        }),
      );

      const data = response.data;

      return {
        data: data.results,
        meta: buildMeta(data.total, page, pageSize),
      };
    } catch (error) {
      throw new HttpException(
        ERROR_MESSAGES.UNSPLASH.FAIL,
        HttpStatus.BAD_GATEWAY,
      );
    }
  }
}
