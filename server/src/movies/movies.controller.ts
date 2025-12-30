import { Controller, Get, Query } from '@nestjs/common';
import { MoviesService } from './movies.service';

@Controller('movies')
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) { }

  @Get('library')
  async getTrending(@Query('limit') limit: string) {
    // Convert query param to number or default to 10
    const limitNum = limit ? parseInt(limit) : 10;
    // const ytsMovies : any[] = await this.moviesService.getYtsTrending();
    const apiBayMovies : any[] = await this.moviesService.getApiBayTrending();
    return apiBayMovies;
    // .map((movie) => ({
    //   id: movie.id,
    //   title: movie.title,
    //   // cover_image: movie.medium_cover_image,
    //   imdb_code: movie.imdb_code,
    //   // year: movie.year,
    //   // rating: movie.rating,
    //   // source: movie.source,
    //   // isWatched: movie.isWatched,
    // }));
    // return ytsMovies.map((movie) => ({
    //   id: movie.id,
    //   title: movie.title_long,
    //   cover_image: movie.medium_cover_image,
    //   imdb_code: movie.imdb_code,
    //   year: movie.year,
    //   rating: movie.rating,
    //   source: movie.source,
    //   isWatched: movie.isWatched,
    // }));
  }
} 
