"use client"
import { useState } from "react";
import { Movie } from "../types/types";
import { MovieCard } from "./MovieCard";
import { Pagination } from "./Pagination";




// MovieGrid Component with Pagination
export const MovieGrid: React.FC<{ 
  movies: Movie[];
  isWatchLater: boolean;
  itemsPerPage: number;
  currentPage: number;
  total: number;
  onPageChange: (pageNum : number) => void;
}> = ({ movies, isWatchLater = false, itemsPerPage = 20 , currentPage, onPageChange, total}) => {
  

  const totalPages = Math.ceil(total / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentMovies = movies.slice(startIndex, endIndex);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="text-sm text-zinc-500">
          Showing {startIndex + 1}-{Math.min(endIndex, total)} of {total.toLocaleString()}
        </div>
        <div className="text-sm text-zinc-500">
          Page {currentPage} of {totalPages}
        </div>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {currentMovies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} isWatchLater={isWatchLater} />
        ))}
      </div>
      
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
};
