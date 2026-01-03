"use client"
import React, { useState } from 'react';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface Movie {
  id: string;
  title: string;
  year: number;
  rating: number;
  posterUrl: string;
}

interface User {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  watchedCount: number;
  watchLaterCount: number;
  commentsCount: number;
}

interface Comment {
  id: string;
  movieId: string;
  movieTitle: string;
  moviePosterUrl: string;
  content: string;
  rating: number;
  timestamp: string;
  likes: number;
}

type TabType = 'watched' | 'watchLater' | 'comments';

// ============================================================================
// MOCK DATA
// ============================================================================

const mockUser: User = {
  id: '1',
  username: '@cinephile_alex',
  displayName: 'Alex Rodriguez',
  avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&h=400&fit=crop',
  watchedCount: 342,
  watchLaterCount: 1247,
  commentsCount: 89,
};

// Generate mock movies for pagination
const generateMockMovies = (count: number, startId: number = 1): Movie[] => {
  const titles = [
    'The Shawshank Redemption', 'The Dark Knight', 'Inception', 'Pulp Fiction',
    'Interstellar', 'The Matrix', 'Forrest Gump', 'The Godfather',
    'Fight Club', 'Goodfellas', 'The Prestige', 'Parasite',
    'Dune', 'The Batman', 'Everything Everywhere All at Once',
    'No Country for Old Men', 'Blade Runner 2049', 'Arrival',
    'Whiplash', 'La La Land', 'Joker', 'Oppenheimer',
    'The Grand Budapest Hotel', 'Mad Max: Fury Road', 'Moonlight'
  ];

  const posters = [
    'https://images.unsplash.com/photo-1594908900066-3f47337549d8?w=300&h=450&fit=crop',
    'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=300&h=450&fit=crop',
    'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=300&h=450&fit=crop',
    'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=300&h=450&fit=crop',
    'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=300&h=450&fit=crop',
    'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=300&h=450&fit=crop',
  ];

  return Array.from({ length: count }, (_, i) => {
    const titleIndex = i % titles.length;
    const posterIndex = i % posters.length;
    return {
      id: String(startId + i),
      title: `${titles[titleIndex]} ${i > 24 ? `(${Math.floor(i / 25)})` : ''}`.trim(),
      year: 1990 + (i % 34),
      rating: 7.0 + Math.random() * 2.3,
      posterUrl: posters[posterIndex],
    };
  });
};

const mockWatchedMovies = generateMockMovies(342);
const mockWatchLaterMovies = generateMockMovies(1247, 500);

const mockComments: Comment[] = [
  {
    id: '1',
    movieId: '1',
    movieTitle: 'The Shawshank Redemption',
    moviePosterUrl: 'https://images.unsplash.com/photo-1594908900066-3f47337549d8?w=300&h=450&fit=crop',
    content: 'An absolute masterpiece. The storytelling, the performances, everything about this film is perfect. Tim Robbins and Morgan Freeman deliver career-defining performances.',
    rating: 10,
    timestamp: '2 days ago',
    likes: 24,
  },
  {
    id: '2',
    movieId: '2',
    movieTitle: 'Inception',
    moviePosterUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=300&h=450&fit=crop',
    content: 'Nolan at his finest. The dream sequences are mind-bending and the practical effects hold up incredibly well. Hans Zimmer\'s score is phenomenal.',
    rating: 9,
    timestamp: '5 days ago',
    likes: 18,
  },
  {
    id: '3',
    movieId: '3',
    movieTitle: 'Parasite',
    moviePosterUrl: 'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=300&h=450&fit=crop',
    content: 'Bong Joon-ho crafts a perfect blend of dark comedy and social commentary. Every scene is meticulously planned. Truly deserved the Palme d\'Or.',
    rating: 10,
    timestamp: '1 week ago',
    likes: 31,
  },
  {
    id: '4',
    movieId: '4',
    movieTitle: 'The Dark Knight',
    moviePosterUrl: 'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=300&h=450&fit=crop',
    content: 'Heath Ledger\'s Joker is iconic. This transcends the superhero genre and becomes a crime thriller masterpiece. The interrogation scene alone is worth the watch.',
    rating: 9,
    timestamp: '1 week ago',
    likes: 42,
  },
  {
    id: '5',
    movieId: '5',
    movieTitle: 'Interstellar',
    moviePosterUrl: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=300&h=450&fit=crop',
    content: 'Visually stunning and emotionally powerful. The docking scene had me on the edge of my seat. Science fiction at its absolute best.',
    rating: 9,
    timestamp: '2 weeks ago',
    likes: 27,
  },
  {
    id: '6',
    movieId: '6',
    movieTitle: 'Pulp Fiction',
    moviePosterUrl: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=300&h=450&fit=crop',
    content: 'Tarantino\'s non-linear storytelling is brilliant. Every dialogue scene is quotable. Samuel L. Jackson and John Travolta have incredible chemistry.',
    rating: 8,
    timestamp: '3 weeks ago',
    likes: 19,
  },
  {
    id: '7',
    movieId: '7',
    movieTitle: 'The Matrix',
    moviePosterUrl: 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=300&h=450&fit=crop',
    content: 'Revolutionary film that changed action cinema forever. The bullet-time effects were groundbreaking. Still holds up amazingly well today.',
    rating: 9,
    timestamp: '1 month ago',
    likes: 33,
  },
  {
    id: '8',
    movieId: '8',
    movieTitle: 'Forrest Gump',
    moviePosterUrl: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=300&h=450&fit=crop',
    content: 'Tom Hanks gives one of the best performances of his career. A heartwarming journey through American history. "Life is like a box of chocolates..."',
    rating: 8,
    timestamp: '1 month ago',
    likes: 28,
  },
];

// ============================================================================
// COMPONENTS
// ============================================================================

// ProfileHeader Component
const ProfileHeader: React.FC<{ user: User }> = ({ user }) => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800">
      {/* Decorative background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-40 h-40 bg-red-600 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-red-600 blur-3xl"></div>
      </div>
      
      <div className="relative p-8">
        {/* Profile Image with glow effect */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-red-600 blur-xl opacity-20"></div>
            <img
              src={user.avatarUrl}
              alt={user.displayName}
              className="relative w-28 h-28 object-cover border-2 border-red-600/30"
            />
          </div>
        </div>

        {/* User Info */}
        <div className="text-center space-y-2 mb-8">
          <h1 className="text-2xl font-semibold text-white tracking-tight">{user.displayName}</h1>
          <p className="text-zinc-400 text-sm">{user.username}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-1 bg-black/30 p-1">
          <div className="bg-zinc-900/50 p-4 text-center hover:bg-zinc-800/50 transition-colors">
            <div className="text-2xl font-bold text-white mb-1">{user.watchedCount.toLocaleString()}</div>
            <div className="text-xs text-zinc-400 uppercase tracking-wider">Watched</div>
          </div>
          <div className="bg-zinc-900/50 p-4 text-center hover:bg-zinc-800/50 transition-colors border-x border-zinc-800">
            <div className="text-2xl font-bold text-white mb-1">{user.watchLaterCount.toLocaleString()}</div>
            <div className="text-xs text-zinc-400 uppercase tracking-wider">Watchlist</div>
          </div>
          <div className="bg-zinc-900/50 p-4 text-center hover:bg-zinc-800/50 transition-colors">
            <div className="text-2xl font-bold text-white mb-1">{user.commentsCount}</div>
            <div className="text-xs text-zinc-400 uppercase tracking-wider">Reviews</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Tabs Component
const Tabs: React.FC<{
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  watchedCount: number;
  watchLaterCount: number;
  commentsCount: number;
}> = ({ activeTab, onTabChange, watchedCount, watchLaterCount, commentsCount }) => {
  const tabs = [
    { id: 'watched' as TabType, label: 'Watched Movies', count: watchedCount },
    { id: 'watchLater' as TabType, label: 'Watch Later', count: watchLaterCount },
    { id: 'comments' as TabType, label: 'Comments', count: commentsCount },
  ];

  return (
    <div className="border-b border-zinc-800">
      <div className="flex gap-8 px-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`py-4 font-medium transition-all whitespace-nowrap relative ${
              activeTab === tab.id
                ? 'text-white'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <span>{tab.label}</span>
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

// MovieCard Component
const MovieCard: React.FC<{ movie: Movie; isWatchLater?: boolean }> = ({ 
  movie, 
  isWatchLater = false 
}) => {
  return (
    <div className="group relative bg-zinc-900 overflow-hidden transition-transform duration-200 hover:scale-105">
      {isWatchLater && (
        <div className="absolute top-2 right-2 z-10 bg-yellow-600 text-black px-2 py-1 text-xs font-semibold">
          WATCH LATER
        </div>
      )}

      <div className="aspect-[2/3] overflow-hidden bg-zinc-800">
        <img
          src={movie.posterUrl}
          alt={movie.title}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-3">
        <h3 className="text-white font-medium text-sm mb-1 line-clamp-2">{movie.title}</h3>
        <div className="flex items-center justify-between text-xs">
          <span className="text-zinc-400">{movie.year}</span>
          <div className="flex items-center gap-1">
            <span>⭐</span>
            <span className="text-white font-medium">{movie.rating.toFixed(1)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Pagination Component
const Pagination: React.FC<{
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}> = ({ currentPage, totalPages, onPageChange }) => {
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const showPages = 5;
    
    if (totalPages <= showPages + 2) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    pages.push(1);
    
    let start = Math.max(2, currentPage - 1);
    let end = Math.min(totalPages - 1, currentPage + 1);
    
    if (currentPage <= 3) {
      end = showPages - 1;
    }
    if (currentPage >= totalPages - 2) {
      start = totalPages - showPages + 2;
    }
    
    if (start > 2) pages.push('...');
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    if (end < totalPages - 1) pages.push('...');
    pages.push(totalPages);
    
    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-4 py-2 bg-zinc-800 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-zinc-700 transition-colors text-sm font-medium"
      >
        Previous
      </button>
      
      <div className="flex gap-1">
        {getPageNumbers().map((page, idx) => (
          <button
            key={idx}
            onClick={() => typeof page === 'number' && onPageChange(page)}
            disabled={page === '...'}
            className={`px-4 py-2 transition-colors text-sm font-medium ${
              page === currentPage
                ? 'bg-white text-black'
                : page === '...'
                ? 'bg-transparent text-zinc-600 cursor-default'
                : 'bg-zinc-800 text-white hover:bg-zinc-700'
            }`}
          >
            {page}
          </button>
        ))}
      </div>
      
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-4 py-2 bg-zinc-800 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-zinc-700 transition-colors text-sm font-medium"
      >
        Next
      </button>
    </div>
  );
};

// MovieGrid Component with Pagination
const MovieGrid: React.FC<{ 
  movies: Movie[]; 
  isWatchLater?: boolean;
  itemsPerPage?: number;
}> = ({ movies, isWatchLater = false, itemsPerPage = 20 }) => {
  const [currentPage, setCurrentPage] = useState(1);
  
  const totalPages = Math.ceil(movies.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentMovies = movies.slice(startIndex, endIndex);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="text-sm text-zinc-500">
          Showing {startIndex + 1}-{Math.min(endIndex, movies.length)} of {movies.length.toLocaleString()}
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
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
};

// CommentCard Component
const CommentCard: React.FC<{ comment: Comment }> = ({ comment }) => {
  return (
    <div className="bg-zinc-900 p-4 sm:p-6 border-b border-zinc-800 hover:bg-zinc-900/50 transition-colors">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-shrink-0 w-16 sm:w-16">
          <img
            src={comment.moviePosterUrl}
            alt={comment.movieTitle}
            className="w-full h-24 object-cover"
          />
        </div>
        
        <div className="flex-1 min-w-0 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
            <div className="min-w-0">
              <h3 className="text-white font-medium text-sm sm:text-base truncate">{comment.movieTitle}</h3>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <span
                      key={i}
                      className={`text-xs ${
                        i < comment.rating ? 'text-yellow-500' : 'text-zinc-700'
                      }`}
                    >
                      ⭐
                    </span>
                  ))}
                </div>
                <span className="text-zinc-500 text-xs">{comment.timestamp}</span>
              </div>
            </div>
          </div>
          
          <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed break-words">{comment.content}</p>
          
          <div className="flex items-center gap-4 pt-2">
            <button className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
              <span className="text-xs font-medium">{comment.likes}</span>
            </button>
            <button className="text-zinc-500 hover:text-white transition-colors text-xs font-medium">
              Reply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Comments Section
const CommentsSection: React.FC<{ comments: Comment[] }> = ({ comments }) => {
  return (
    <div className="space-y-0">
      <div className="text-sm text-zinc-500 px-6 py-4 bg-zinc-900">
        {comments.length} comments
      </div>
      
      <div>
        {comments.map((comment) => (
          <CommentCard key={comment.id} comment={comment} />
        ))}
      </div>
      
      <button className="w-full py-4 bg-zinc-800 hover:bg-zinc-700 text-white transition-colors text-sm font-medium">
        Load More Comments
      </button>
    </div>
  );
};

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

const ProfilePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('watched');

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="bg-black border-b border-zinc-900 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-red-600">MOVIETRACKER</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <aside className="lg:col-span-3">
            <div className="lg:sticky lg:top-24">
              <ProfileHeader user={mockUser} />
            </div>
          </aside>

          <div className="lg:col-span-9">
            <div className="bg-zinc-950 border border-zinc-900 overflow-hidden">
              {/* Tabs Navigation */}
              <Tabs
                activeTab={activeTab}
                onTabChange={setActiveTab}
                watchedCount={mockUser.watchedCount}
                watchLaterCount={mockUser.watchLaterCount}
                commentsCount={mockUser.commentsCount}
              />

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'watched' && (
                  <MovieGrid movies={mockWatchedMovies} itemsPerPage={20} />
                )}
                
                {activeTab === 'watchLater' && (
                  <MovieGrid movies={mockWatchLaterMovies} isWatchLater itemsPerPage={20} />
                )}
                
                {activeTab === 'comments' && (
                  <CommentsSection comments={mockComments} />
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-black border-t border-zinc-900 mt-16">
        <div className="max-w-7xl mx-auto px-6 py-8 text-center text-zinc-600 text-xs">
          <p>© 2024 MovieTracker. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default ProfilePage;