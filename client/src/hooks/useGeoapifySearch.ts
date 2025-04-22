import { useState, useCallback } from 'react';
import axios from 'axios';
import { LocationResult } from '@/contexts/LocationContext';

// Default API endpoint
const GEOAPIFY_API_URL = 'https://api.geoapify.com/v1/geocode/search';

// Access the API key from environment variables
const GEOAPIFY_API_KEY = import.meta.env.VITE_GEOAPIFY_API_KEY || '';

interface GeoapifySearchHook {
  loading: boolean;
  error: string | null;
  searchResults: LocationResult[];
  searchLocations: (query: string) => Promise<LocationResult[]>;
  clearResults: () => void;
}

export function useGeoapifySearch(): GeoapifySearchHook {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<LocationResult[]>([]);

  const searchLocations = useCallback(async (query: string): Promise<LocationResult[]> => {
    setLoading(true);
    setError(null);
    
    try {
      if (!GEOAPIFY_API_KEY) {
        throw new Error('Geoapify API key is missing');
      }
      
      const response = await axios.get(GEOAPIFY_API_URL, {
        params: {
          text: query,
          apiKey: GEOAPIFY_API_KEY,
          format: 'json',
          limit: 5
        }
      });
      
      if (response.status !== 200) {
        throw new Error('Failed to fetch location data');
      }
      
      const results = response.data.results.map((result: any) => ({
        name: result.name || result.formatted.split(',')[0],
        address: result.formatted,
        lat: result.lat,
        lon: result.lon,
        formatted: result.formatted
      }));
      
      setSearchResults(results);
      setLoading(false);
      
      return results;
    } catch (err) {
      // Handle API errors gracefully
      console.error('Error fetching location data:', err);
      setError('Error searching for locations. Please try again later.');
      
      // Return an empty array in case of error
      setSearchResults([]);
      setLoading(false);
      
      return [];
    }
  }, []);

  const clearResults = useCallback(() => {
    setSearchResults([]);
    setError(null);
  }, []);

  return {
    loading,
    error,
    searchResults,
    searchLocations,
    clearResults
  };
}