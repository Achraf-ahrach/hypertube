

export interface MovieThumbnail {
    id: number;
    title: string;
    cover_image: string;
    imdb_code: string;
    year: number;
    rating: number;
    source: 'YTS' | '1337x';
    isWatched: boolean;
    summary: string;
    runtime: number;
    genres: string[];
}