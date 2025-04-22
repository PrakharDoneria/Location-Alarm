import { useState, useEffect, useRef } from 'react';
import { LatLng } from 'leaflet';
import { useLocation } from '@/contexts/LocationContext';
import { useGeoapifySearch } from '@/hooks/useGeoapifySearch';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { LocationResult } from '@/contexts/LocationContext';

const SearchBar: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  
  const { 
    searchQuery, 
    setSearchQuery, 
    searchResults, 
    setSearchResults,
    isSearching,
    setIsSearching,
    setDestination
  } = useLocation();
  
  const { loading, error, searchLocations, clearResults } = useGeoapifySearch();

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    
    if (value.trim().length > 0) {
      setSearchQuery(value);
      setShowResults(true);
    } else {
      clearResults();
      setShowResults(false);
    }
  };

  // Handle search when search query changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim().length > 0) {
        setIsSearching(true);
        searchLocations(searchQuery)
          .then(results => {
            setSearchResults(results);
            setIsSearching(false);
          })
          .catch(() => {
            setIsSearching(false);
          });
      }
    }, 300); // Debounce search

    return () => clearTimeout(timer);
  }, [searchQuery, searchLocations, setSearchResults, setIsSearching]);

  // Handle selection of location from results
  const handleLocationSelect = (location: LocationResult) => {
    setInputValue(location.name);
    setDestination(
      new LatLng(location.lat, location.lon),
      { name: location.name, address: location.address || location.formatted || '' }
    );
    setShowResults(false);
    inputRef.current?.blur(); // Dismiss keyboard on mobile
  };

  // Handle clicks outside the search component
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (resultsRef.current && !resultsRef.current.contains(event.target as Node) &&
          inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Clear the search input
  const handleClearInput = () => {
    setInputValue('');
    setSearchQuery('');
    clearResults();
    setShowResults(false);
    inputRef.current?.focus();
  };

  return (
    <div className="relative w-full z-10">
      <div className={cn(
        "flex items-center bg-white/10 backdrop-blur-md rounded-lg px-3 py-2 transition-all duration-200",
        isFocused ? "ring-2 ring-blue-500 bg-white/15" : "ring-1 ring-white/20"
      )}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-gray-300 mr-2"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search for a destination..."
          className="bg-transparent border-none ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-white placeholder:text-gray-400 flex-1 py-1"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => {
            setIsFocused(true);
            if (inputValue.trim().length > 0) setShowResults(true);
          }}
          onBlur={() => setIsFocused(false)}
        />
        
        {inputValue && (
          <button
            type="button"
            onClick={handleClearInput}
            className="text-gray-400 hover:text-white ml-1"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="m15 9-6 6" />
              <path d="m9 9 6 6" />
            </svg>
          </button>
        )}
      </div>
      
      {/* Search Results */}
      {showResults && (
        <div 
          ref={resultsRef}
          className="absolute mt-2 w-full rounded-lg bg-gradient-to-b from-gray-800 to-gray-900 shadow-lg overflow-hidden z-20 max-h-64 overflow-y-auto"
        >
          {loading || isSearching ? (
            <div className="p-3 text-center text-gray-300">
              <svg
                className="animate-spin h-5 w-5 mx-auto mb-1"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Searching...
            </div>
          ) : searchResults.length > 0 ? (
            <>
              {searchResults.map((result, index) => (
                <div
                  key={`${result.lat}-${result.lon}-${index}`}
                  className="px-3 py-2 hover:bg-gray-700 cursor-pointer border-b border-gray-700 last:border-none"
                  onClick={() => handleLocationSelect(result)}
                >
                  <div className="font-medium text-white">{result.name}</div>
                  <div className="text-sm text-gray-400 truncate">
                    {result.address || result.formatted}
                  </div>
                </div>
              ))}
            </>
          ) : (
            <div className="p-3 text-center text-gray-400">
              {error ? "Error loading results. Try again." : "No results found"}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;