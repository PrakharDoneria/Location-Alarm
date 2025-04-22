import { useState, useCallback } from 'react';
import axios from 'axios';
import { LocationResult } from '@/contexts/LocationContext';

// Default API endpoint
const GEOAPIFY_API_URL = 'https://api.geoapify.com/v1/geocode/search';

// This would typically be stored securely in env variables
// This is just a placeholder for demo purposes
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
      // Use mock data if API key is missing or if there's an error
      // This is just for demo purposes to show functionality
      console.error('Error fetching location data:', err);
      setError('Error searching for locations. Using demo data.');
      
      // Demo data for development without API key
      const mockResults = [
        {
          name: 'Central Park',
          address: 'Central Park, New York, NY, USA',
          lat: 40.7812,
          lon: -73.9665,
          formatted: 'Central Park, New York, NY, USA'
        },
        {
          name: 'Empire State Building',
          address: '350 5th Ave, New York, NY 10118, USA',
          lat: 40.7484,
          lon: -73.9857,
          formatted: '350 5th Ave, New York, NY 10118, USA'
        },
        {
          name: 'Times Square',
          address: 'Times Square, New York, NY 10036, USA',
          lat: 40.7580,
          lon: -73.9855,
          formatted: 'Times Square, New York, NY 10036, USA'
        }
      ].filter(location => 
        location.name.toLowerCase().includes(query.toLowerCase()) || 
        location.address.toLowerCase().includes(query.toLowerCase())
      );
      
      setSearchResults(mockResults);
      setLoading(false);
      
      return mockResults;
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