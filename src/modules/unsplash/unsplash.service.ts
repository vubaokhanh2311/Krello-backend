import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { UnsplashQueryDto } from './dtos/unsplash.dto';
import { getPagination, buildMeta } from '../../common/utils/index';
import { ERROR_MESSAGES } from '../../constants/index';
@Injectable()
export class UnsplashService {
  private accessKey = process.env.UNSPLASH_ACCESS_KEY;

  constructor(private readonly httpService: HttpService) {}

  async findAll(query: UnsplashQueryDto, searchQuery: string) {
    const { page, pageSize } = getPagination(query);

    if (!this.accessKey || this.accessKey === 'your_unsplash_access_key') {
      return {
        data: [
          {
            id: 'mock-bg-1',
            urls: {
              raw: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
              full: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
              regular:
                'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1080',
              small:
                'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400',
              thumb:
                'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=200',
            },
            alt_description: 'Landscape background 1',
          },
          {
            id: 'mock-bg-2',
            urls: {
              raw: 'https://images.unsplash.com/photo-1511884642898-4c92249e20b6',
              full: 'https://images.unsplash.com/photo-1511884642898-4c92249e20b6',
              regular:
                'https://images.unsplash.com/photo-1511884642898-4c92249e20b6?w=1080',
              small:
                'https://images.unsplash.com/photo-1511884642898-4c92249e20b6?w=400',
              thumb:
                'https://images.unsplash.com/photo-1511884642898-4c92249e20b6?w=200',
            },
            alt_description: 'Landscape background 2',
          },
          {
            id: 'mock-bg-3',
            urls: {
              raw: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05',
              full: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05',
              regular:
                'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1080',
              small:
                'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400',
              thumb:
                'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=200',
            },
            alt_description: 'Landscape background 3',
          },
          {
            id: 'mock-bg-4',
            urls: {
              raw: 'https://images.unsplash.com/photo-1426604966848-d7adac402bff',
              full: 'https://images.unsplash.com/photo-1426604966848-d7adac402bff',
              regular:
                'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=1080',
              small:
                'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=400',
              thumb:
                'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=200',
            },
            alt_description: 'Landscape background 4',
          },
        ],
        meta: buildMeta(4, page, pageSize),
      };
    }

    try {
      const url = 'https://api.unsplash.com/search/photos';

      const response = await lastValueFrom(
        this.httpService.get<{ results: unknown[]; total: number }>(url, {
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
    } catch {
      throw new HttpException(
        ERROR_MESSAGES.UNSPLASH.FAIL,
        HttpStatus.BAD_GATEWAY,
      );
    }
  }
}
